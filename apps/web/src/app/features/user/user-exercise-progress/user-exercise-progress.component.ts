import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WorkoutProgressService } from '../../../core/services/workout-progress.service';
import { ExerciseProgressDto, ExerciseProgressPointDto, LoggedExerciseNameDto } from '../../../shared/models/workout-progress.model';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { ProgressRange, ProgressSessionRow } from '../../../core/models/user-exercise-progress.model';

const RANGE_DAYS: Record<ProgressRange, number | null> = { '1M': 30, '3M': 91, '6M': 182, 'All': null };
const QUICK_PICK_COUNT = 6;

// Chart colours mirror the member tokens (canvas can't read CSS variables).
const CHART = {
  line: '#2563eb',
  pr: '#f97316',
  grid: '#eef1f7',
  tick: '#5b6784'
};

@Component({
  selector: 'app-user-exercise-progress',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, BaseChartDirective, DropdownComponent],
  templateUrl: './user-exercise-progress.component.html',
  styleUrl: './user-exercise-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserExerciseProgressComponent implements OnInit {
  private workoutProgressService = inject(WorkoutProgressService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly ranges: ProgressRange[] = ['1M', '3M', '6M', 'All'];

  readonly exerciseNames = signal<LoggedExerciseNameDto[]>([]);
  readonly progress = signal<ExerciseProgressDto | null>(null);
  readonly isLoadingNames = signal(true);
  readonly isLoadingProgress = signal(false);
  readonly range = signal<ProgressRange>('3M');

  readonly exerciseControl = new FormControl<string | null>(null);

  readonly exerciseOptions = computed<DropdownOption[]>(() =>
    this.exerciseNames().map(e => ({ label: e.muscleGroup ? `${e.name} (${e.muscleGroup})` : e.name, value: e.name }))
  );

  /** Most recently logged exercises as one-tap chips. */
  readonly quickPicks = computed(() =>
    [...this.exerciseNames()]
      .sort((a, b) => new Date(b.lastLoggedDate).getTime() - new Date(a.lastLoggedDate).getTime())
      .slice(0, QUICK_PICK_COUNT)
  );

  readonly selectedName = signal<string | null>(null);

  readonly visiblePoints = computed<ExerciseProgressPointDto[]>(() => {
    const points = this.progress()?.points ?? [];
    const days = RANGE_DAYS[this.range()];
    if (!days || points.length === 0) return points;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return points.filter(p => new Date(p.date).getTime() >= cutoff);
  });

  readonly trend = computed(() => {
    const points = this.visiblePoints();
    if (points.length < 2) return null;
    const first = points[0].topWeight;
    const kg = this.roundWeight(points[points.length - 1].topWeight - first);
    const pct = first !== 0 ? Math.round((kg / first) * 1000) / 10 : 0;
    return { kg: Math.abs(kg), pct: Math.abs(pct), isUp: kg >= 0 };
  });

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const points = this.visiblePoints();
    const pb = this.progress()?.personalBest ?? null;
    const prIndex = points.findIndex(p => p.topWeight === pb);
    return {
      labels: points.map(p => this.formatShortDate(p.date)),
      datasets: [{
        data: points.map(p => p.topWeight),
        label: 'Top set weight',
        borderColor: CHART.line,
        borderWidth: 2,
        pointBackgroundColor: points.map((_, i) => (i === prIndex ? CHART.pr : CHART.line)),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: points.map((_, i) => (i === prIndex ? 6 : 4)),
        pointHoverRadius: 7,
        pointHitRadius: 16,
        fill: false,
        tension: 0
      }]
    };
  });

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: CHART.tick,
        bodyColor: '#0b1530',
        borderColor: '#e2e7f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: ctx => {
            const point = this.visiblePoints()[ctx.dataIndex];
            return point ? `${point.topWeight} kg × ${point.topWeightReps}` : `${ctx.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: CHART.tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
      },
      y: {
        grace: '10%',
        border: { display: false },
        grid: { color: CHART.grid },
        ticks: { color: CHART.tick, maxTicksLimit: 5, callback: v => `${v}` }
      }
    }
  };

  readonly sessionRows = computed<ProgressSessionRow[]>(() => {
    const progress = this.progress();
    if (!progress) return [];
    const pb = progress.personalBest;

    return [...progress.points].reverse().map((p, idx, arr) => {
      const older = arr[idx + 1];
      const delta = older ? this.roundWeight(p.topWeight - older.topWeight) : null;
      return {
        date: p.date,
        weight: p.topWeight,
        reps: p.topWeightReps,
        isPr: p.topWeight === pb,
        deltaLabel: delta === null ? 'First log' : delta === 0 ? 'Same' : delta > 0 ? `+${delta} kg` : `−${Math.abs(delta)} kg`,
        deltaClass: delta === null || delta === 0 ? 'neutral' : delta > 0 ? 'up' : 'down'
      };
    });
  });

  ngOnInit(): void {
    this.exerciseControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(name => {
        if (name && name !== this.selectedName()) this.selectExercise(name);
      });

    this.loadExerciseNames();
  }

  private loadExerciseNames(): void {
    this.isLoadingNames.set(true);
    this.workoutProgressService.getLoggedExerciseNames()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.exerciseNames.set(res?.data || []);
          this.isLoadingNames.set(false);
          const first = this.quickPicks()[0];
          if (first) this.selectExercise(first.name);
        },
        error: () => this.isLoadingNames.set(false)
      });
  }

  selectExercise(name: string): void {
    this.selectedName.set(name);
    this.exerciseControl.setValue(name, { emitEvent: false });
    this.isLoadingProgress.set(true);
    this.progress.set(null);

    this.workoutProgressService.getExerciseProgress(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.progress.set(res?.data || null);
          this.isLoadingProgress.set(false);
        },
        error: () => this.isLoadingProgress.set(false)
      });
  }

  setRange(range: ProgressRange): void {
    this.range.set(range);
  }

  goToWorkoutLog(): void {
    this.router.navigate(['/user/performance']);
  }

  private roundWeight(w: number): number {
    return Math.round(w * 10) / 10;
  }

  private formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
