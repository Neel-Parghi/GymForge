import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WorkoutProgressService } from '../../../core/services/workout-progress.service';
import { ExerciseProgressDto, LoggedExerciseNameDto } from '../../../shared/models/workout-progress.model';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';

interface SessionRow {
  date: string;
  weight: number;
  reps: number;
  isPr: boolean;
  deltaLabel: string;
  deltaClass: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-user-exercise-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, DropdownComponent],
  templateUrl: './user-exercise-progress.component.html',
  styleUrl: './user-exercise-progress.component.scss'
})
export class UserExerciseProgressComponent implements OnInit {
  exerciseNames: LoggedExerciseNameDto[] = [];
  exerciseOptions: DropdownOption[] = [];

  selectedExercise: LoggedExerciseNameDto | null = null;
  selectedExerciseValue: string | null = null;
  progress: ExerciseProgressDto | null = null;
  sessionRows: SessionRow[] = [];

  isLoadingNames = true;
  isLoadingProgress = false;

  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}kg`
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grace: '10%', ticks: { callback: (v) => `${v}kg` } }
    }
  };

  constructor(
    private workoutProgressService: WorkoutProgressService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExerciseNames();
  }

  loadExerciseNames(): void {
    this.isLoadingNames = true;
    this.workoutProgressService.getLoggedExerciseNames().subscribe({
      next: (res) => {
        this.exerciseNames = res?.data || [];
        this.exerciseOptions = this.exerciseNames.map(e => ({
          label: e.muscleGroup ? `${e.name} (${e.muscleGroup})` : e.name,
          value: e.name
        }));
        this.isLoadingNames = false;
        if (this.exerciseNames.length > 0) {
          this.selectExercise(this.exerciseNames[0]);
        }
      },
      error: () => {
        this.isLoadingNames = false;
      }
    });
  }

  onExerciseValueChange(exerciseName: string): void {
    const exercise = this.exerciseNames.find(e => e.name === exerciseName);
    if (exercise) {
      this.selectExercise(exercise);
    }
  }

  selectExercise(exercise: LoggedExerciseNameDto): void {
    this.selectedExercise = exercise;
    this.selectedExerciseValue = exercise.name;
    this.isLoadingProgress = true;
    this.progress = null;
    this.sessionRows = [];

    this.workoutProgressService.getExerciseProgress(exercise.name).subscribe({
      next: (res) => {
        this.progress = res?.data || null;
        this.buildChart();
        this.buildSessionRows();
        this.isLoadingProgress = false;
      },
      error: () => {
        this.isLoadingProgress = false;
      }
    });
  }

  private buildChart(): void {
    if (!this.progress) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    const labels = this.progress.points.map(p => this.formatShortDate(p.date));
    const data = this.progress.points.map(p => p.topWeight);

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Top set weight',
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.14)',
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35
        }
      ]
    };
  }

  private buildSessionRows(): void {
    if (!this.progress) return;

    const points = this.progress.points;
    const pb = this.progress.personalBest;

    this.sessionRows = [...points].reverse().map((p, idx, arr) => {
      const older = arr[idx + 1];
      const delta = older ? this.roundWeight(p.topWeight - older.topWeight) : null;
      const deltaLabel = delta === null ? 'First log' : (delta === 0 ? 'No change' : (delta > 0 ? `+${delta}kg` : `${delta}kg`));
      const deltaClass: 'up' | 'down' | 'neutral' = delta === null || delta === 0 ? 'neutral' : (delta > 0 ? 'up' : 'down');

      return {
        date: p.date,
        weight: p.topWeight,
        reps: p.topWeightReps,
        isPr: p.topWeight === pb,
        deltaLabel,
        deltaClass
      };
    });
  }

  get trend(): { kg: number; pct: number; isUp: boolean } | null {
    if (!this.progress || this.progress.points.length < 2) return null;
    const first = this.progress.points[0].topWeight;
    const last = this.progress.points[this.progress.points.length - 1].topWeight;
    const kg = this.roundWeight(last - first);
    const pct = first !== 0 ? Math.round((kg / first) * 100) : 0;
    return { kg: Math.abs(kg), pct: Math.abs(pct), isUp: kg >= 0 };
  }

  private roundWeight(w: number): number {
    return Math.round(w * 10) / 10;
  }

  formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  goToWorkoutLog(): void {
    this.router.navigate(['/user/performance']);
  }
}
