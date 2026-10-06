import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WorkoutProgressService } from '../../../core/services/workout-progress.service';
import { MuscleGroupProgressDto } from '../../../shared/models/workout-progress.model';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { GroupExerciseCard } from '../../../core/models/user-exercise-progress.model';
import { compareSessions, formatSet, formatVolume, sparklinePoints, trendDir } from '../../../shared/utils/workout-progress';

const SPARK_WIDTH = 64;
const SPARK_HEIGHT = 28;

@Component({
  selector: 'app-user-exercise-progress-overview',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, DropdownComponent],
  templateUrl: './user-exercise-progress-overview.component.html',
  styleUrl: './user-exercise-progress-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserExerciseProgressOverviewComponent implements OnInit {
  private workoutProgressService = inject(WorkoutProgressService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly sparkWidth = SPARK_WIDTH;
  readonly sparkHeight = SPARK_HEIGHT;

  readonly groups = signal<MuscleGroupProgressDto[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly activeGroupName = signal<string | null>(null);

  readonly searchControl = new FormControl<string | null>(null);

  readonly activeGroup = computed(() =>
    this.groups().find(g => g.muscleGroup === this.activeGroupName()) ?? this.groups()[0] ?? null
  );

  readonly exerciseOptions = computed<DropdownOption[]>(() =>
    this.groups()
      .flatMap(g => g.exercises.map(e => ({ label: `${e.name} (${g.muscleGroup})`, value: e.name })))
      .sort((a, b) => a.label.localeCompare(b.label))
  );

  readonly weekly = computed(() => {
    const group = this.activeGroup();
    if (!group) return null;
    const pct = group.previousWeeklyVolume > 0
      ? Math.round(((group.weeklyVolume - group.previousWeeklyVolume) / group.previousWeeklyVolume) * 100)
      : null;
    return {
      sessions: group.weeklySessions,
      sets: group.weeklySets,
      volume: formatVolume(group.weeklyVolume),
      volumeChange: pct === null || pct === 0 ? null : { label: `${pct > 0 ? '↑' : '↓'} ${Math.abs(pct)}% volume`, isUp: pct > 0 }
    };
  });

  readonly cards = computed<GroupExerciseCard[]>(() =>
    (this.activeGroup()?.exercises ?? []).map(e => {
      const isBodyweight = e.last.topWeight <= 0;
      return {
        name: e.name,
        date: e.last.date,
        summary: isBodyweight ? `${e.last.totalReps} reps` : `${formatVolume(e.last.volume)} kg`,
        sets: e.last.sets.map(s => ({
          setNo: s.setNo,
          label: formatSet(s),
          isPr: e.isNewPersonalBest && s.weight === e.last.topWeight
        })),
        comparedTo: e.previous?.date ?? null,
        change: compareSessions(e.last, e.previous),
        isNewPersonalBest: e.isNewPersonalBest,
        spark: sparklinePoints(e.trend, SPARK_WIDTH, SPARK_HEIGHT),
        sparkDir: trendDir(e.trend)
      };
    })
  );

  readonly groupSummary = computed(() => {
    const cards = this.cards().filter(c => c.change);
    if (cards.length === 0) return null;
    const up = cards.filter(c => c.change?.dir === 'up').length;
    const down = cards.filter(c => c.change?.dir === 'down');
    const parts = [`${up} of ${cards.length} ${cards.length === 1 ? 'lift' : 'lifts'} went up last time.`];
    if (down.length === 1) parts.push(`${down[0].name} dipped.`);
    if (down.length > 1) parts.push(`${down.length} dipped.`);
    return parts.join(' ');
  });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(name => {
        if (name) this.router.navigate(['/user/exercise-progress/breakdown', name]);
      });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.workoutProgressService.getMuscleGroupProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.groups.set(res?.data ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadFailed.set(true);
          this.isLoading.set(false);
        }
      });
  }

  selectGroup(name: string): void {
    this.activeGroupName.set(name);
  }

  goToWorkoutLog(): void {
    this.router.navigate(['/user/performance']);
  }
}
