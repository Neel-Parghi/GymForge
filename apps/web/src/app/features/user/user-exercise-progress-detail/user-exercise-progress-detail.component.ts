import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WorkoutProgressService } from '../../../core/services/workout-progress.service';
import { ExerciseProgressDto, ExerciseProgressPointDto } from '../../../shared/models/workout-progress.model';
import { SegmentedTabsComponent } from '../../../shared/components/segmented-tabs/segmented-tabs.component';
import { SegmentedTab } from '../../../shared/models/segmented-tab.model';
import {
  CompareColumn, CompareTotal, LastSessionSetRow, ProgressHistoryRow, ProgressRange, ProgressView
} from '../../../core/models/user-exercise-progress.model';
import {
  ChangeDir, changeDir, compareSessions, compareSets, formatSet, formatVolume, formatWeight
} from '../../../shared/utils/workout-progress';

const RANGE_DAYS: Record<ProgressRange, number | null> = { '1M': 30, '3M': 91, '6M': 182, 'All': null };
const COMPARE_SESSIONS = 8;

const CHART = {
  line: '#2563eb',
  pr: '#f97316',
  grid: '#eef1f7',
  tick: '#5b6784'
};

@Component({
  selector: 'app-user-exercise-progress-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, BaseChartDirective, SegmentedTabsComponent],
  templateUrl: './user-exercise-progress-detail.component.html',
  styleUrl: './user-exercise-progress-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserExerciseProgressDetailComponent implements OnInit {
  private workoutProgressService = inject(WorkoutProgressService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly ranges: ProgressRange[] = ['1M', '3M', '6M', 'All'];
  readonly viewTabs: SegmentedTab[] = [
    { id: 'compare', label: 'Compare' },
    { id: 'history', label: 'History' },
    { id: 'trend', label: 'Trend' }
  ];

  readonly exerciseName = signal('');
  readonly progress = signal<ExerciseProgressDto | null>(null);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly range = signal<ProgressRange>('3M');
  readonly view = signal<ProgressView>('compare');

  private readonly sessions = computed(() => [...(this.progress()?.points ?? [])].reverse());

  readonly isBodyweight = computed(() => (this.progress()?.personalBest ?? 0) <= 0);

  readonly last = computed(() => this.sessions()[0] ?? null);
  readonly previous = computed(() => this.sessions()[1] ?? null);

  readonly isNewPersonalBest = computed(() => {
    const [last, ...older] = this.sessions();
    return !!last && older.length > 0 && !this.isBodyweight() && last.topWeight > Math.max(...older.map(s => s.topWeight));
  });

  readonly stats = computed(() => {
    const p = this.progress();
    const last = this.last();
    if (!p || !last) return null;
    const prev = this.previous();
    const bestSession = this.isBodyweight()
      ? [...p.points].sort((a, b) => b.totalReps - a.totalReps)[0]
      : [...p.points].filter(s => s.topWeight === p.personalBest).sort((a, b) => b.topWeightReps - a.topWeightReps)[0];
    const volumePct = prev && prev.volume > 0 ? Math.round(((last.volume - prev.volume) / prev.volume) * 100) : null;
    return {
      bestLabel: this.isBodyweight() ? 'Most reps' : 'Best',
      bestValue: this.isBodyweight() ? `${bestSession.totalReps}` : formatWeight(p.personalBest),
      bestUnit: this.isBodyweight() ? 'reps' : 'kg',
      bestSession,
      oneRepMax: p.estimatedOneRepMax,
      volume: formatVolume(last.volume),
      volumeChange: volumePct === null || volumePct === 0 ? null : { label: `${volumePct > 0 ? '↑' : '↓'} ${Math.abs(volumePct)}% last time`, dir: (volumePct > 0 ? 'up' : 'down') as ChangeDir }
    };
  });

  readonly lastSession = computed(() => {
    const last = this.last();
    if (!last) return null;
    const prev = this.previous();
    const volumeDiff = prev ? Math.round(last.volume - prev.volume) : null;
    const rows: LastSessionSetRow[] = last.sets.map((s, i) => ({
      setNo: s.setNo,
      weight: formatWeight(s.weight),
      reps: s.reps,
      change: compareSets(s, prev?.sets[i])
    }));
    return {
      date: last.date,
      dayName: last.dayName,
      totalSets: last.totalSets,
      totalReps: last.totalReps,
      volume: formatVolume(last.volume),
      comparedTo: prev?.date ?? null,
      volumeChange: volumeDiff === null || volumeDiff === 0 ? null : {
        label: `${volumeDiff > 0 ? '↑' : '↓'} ${formatVolume(Math.abs(volumeDiff))} kg`,
        dir: (volumeDiff > 0 ? 'up' : 'down') as ChangeDir
      },
      rows
    };
  });

  
  private readonly compareSessions = computed(() => this.sessions().slice(0, COMPARE_SESSIONS));

  readonly compareRowCount = computed(() => Math.max(0, ...this.compareSessions().map(s => s.sets.length)));
  readonly compareRowLabels = computed(() => Array.from({ length: this.compareRowCount() }, (_, i) => `Set ${i + 1}`));

  readonly compareColumns = computed<CompareColumn[]>(() => {
    const sessions = this.compareSessions();
    const pb = this.progress()?.personalBest ?? 0;
    const rowCount = this.compareRowCount();
    const total = (value: number, older: number | undefined, text: string): CompareTotal => ({ text, dir: changeDir(value, older) });

    return sessions.map((s, i) => {
      const older = sessions[i + 1];
      return {
        date: s.date,
        isLatest: i === 0,
        cells: Array.from({ length: rowCount }, (_, row) => {
          const set = s.sets[row];
          return set
            ? { weight: formatWeight(set.weight), reps: `× ${set.reps}`, isPr: pb > 0 && set.weight === pb, isEmpty: false }
            : { weight: '–', reps: 'no set', isPr: false, isEmpty: true };
        }),
        totals: [
          total(s.totalReps, older?.totalReps, `${s.totalReps}`),
          total(s.volume, older?.volume, formatVolume(s.volume)),
          total(s.topWeight, older?.topWeight, formatWeight(s.topWeight))
        ]
      };
    });
  });

  /** Plain-language notes on what changed across the compared sessions. */
  readonly insights = computed(() => {
    const sessions = this.compareSessions();
    if (sessions.length < 2) return [];
    const newest = sessions[0];
    const oldest = sessions[sessions.length - 1];
    const since = this.formatShortDate(oldest.date);
    const notes: { icon: string; dir: ChangeDir; title: string; text: string }[] = [];

    let index = -1;
    let bestKg = 0;
    for (let i = 0; i < newest.sets.length; i++) {
      const before = oldest.sets[i];
      const kg = before ? newest.sets[i].weight - before.weight : 0;
      if (kg > bestKg) {
        bestKg = kg;
        index = i;
      }
    }
    if (index >= 0) {
      notes.push({
        icon: '↑', dir: 'up',
        title: `Set ${index + 1} is moving most:`,
        text: `${formatSet(oldest.sets[index])} → ${formatSet(newest.sets[index])} since ${since}.`
      });
    }

    if (oldest.volume > 0 && newest.volume !== oldest.volume) {
      const pct = Math.round(((newest.volume - oldest.volume) / oldest.volume) * 100);
      if (pct !== 0) {
        notes.push({
          icon: pct > 0 ? '↑' : '↓', dir: pct > 0 ? 'up' : 'down',
          title: `Volume is ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}%`,
          text: `since ${since} (${formatVolume(oldest.volume)} → ${formatVolume(newest.volume)} kg).`
        });
      }
    }

    if (newest.totalSets !== oldest.totalSets) {
      notes.push({
        icon: newest.totalSets > oldest.totalSets ? '+' : '−', dir: 'same',
        title: `You do ${newest.totalSets} sets now,`,
        text: `${newest.totalSets > oldest.totalSets ? 'up' : 'down'} from ${oldest.totalSets} on ${since}.`
      });
    }
    return notes;
  });

  readonly historyRows = computed<ProgressHistoryRow[]>(() => {
    const pb = this.progress()?.personalBest ?? 0;
    const sessions = this.sessions();
    return sessions.map((s, i) => ({
      date: s.date,
      dayName: s.dayName,
      volume: s.topWeight > 0 ? `${formatVolume(s.volume)} kg` : `${s.totalReps} reps`,
      sets: s.sets.map(set => ({ label: formatSet(set), isPr: pb > 0 && set.weight === pb })),
      change: compareSessions(s, sessions[i + 1] ?? null)
    }));
  });

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

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.exerciseName.set(params.get('exerciseName') ?? '');
        this.view.set('compare');
        this.load();
      });
  }

  load(): void {
    const name = this.exerciseName();
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.progress.set(null);

    this.workoutProgressService.getExerciseProgress(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.progress.set(res?.data || null);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadFailed.set(true);
          this.isLoading.set(false);
        }
      });
  }

  setView(view: string): void {
    this.view.set(view as ProgressView);
  }

  setRange(range: ProgressRange): void {
    this.range.set(range);
  }

  private roundWeight(w: number): number {
    return Math.round(w * 10) / 10;
  }

  private formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
