import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FIELD_LIMITS } from '../../../../shared/constants/validation.constants';
import { WinterArcStore } from '../winter-arc.store';
import {
  ARC_FREEZES_PER_MONTH, ARC_HABIT_SUGGESTIONS, ARC_KEPT_THRESHOLD, ARC_MAX_HABITS, ARC_POINTS,
  ARC_ROUTINE_SUGGESTIONS, ARC_SEASON_DAYS, ARC_SEASON_END, ARC_SEASON_START
} from '../winter-arc.mock';

@Component({
  selector: 'app-arc-join',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './arc-join.component.html',
  styleUrl: './arc-join.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArcJoinComponent {
  private store = inject(WinterArcStore);
  private router = inject(Router);

  readonly limits = FIELD_LIMITS;
  readonly seasonStart = ARC_SEASON_START;
  readonly seasonEnd = ARC_SEASON_END;
  readonly seasonDays = ARC_SEASON_DAYS;
  readonly points = ARC_POINTS;
  readonly keptThreshold = ARC_KEPT_THRESHOLD;
  readonly freezesPerMonth = ARC_FREEZES_PER_MONTH;
  readonly maxHabits = ARC_MAX_HABITS;
  readonly routines = ARC_ROUTINE_SUGGESTIONS;

  readonly trackNutrition = signal(true);
  readonly selected = signal<string[]>(this.store.habits().map(h => h.name));
  readonly custom = signal<string[]>([]);
  readonly customControl = new FormControl('', { nonNullable: true });

  readonly suggestions = computed(() => [...ARC_HABIT_SUGGESTIONS, ...this.custom()]);
  readonly isFull = computed(() => this.selected().length >= ARC_MAX_HABITS);

  isSelected(name: string): boolean {
    return this.selected().includes(name);
  }

  toggle(name: string): void {
    if (this.isSelected(name)) {
      this.selected.update(list => list.filter(n => n !== name));
    } else if (!this.isFull()) {
      this.selected.update(list => [...list, name]);
    }
  }

  addCustom(): void {
    const name = this.customControl.value.trim();
    if (!name || this.isFull()) return;
    const exists = [...this.suggestions(), ...this.routines].some(n => n.toLowerCase() === name.toLowerCase());
    if (!exists) this.custom.update(list => [...list, name]);
    if (!this.selected().some(n => n.toLowerCase() === name.toLowerCase())) this.selected.update(list => [...list, name]);
    this.customControl.reset('');
  }

  start(): void {
    if (!this.selected().length) return;
    this.store.join(this.selected(), this.trackNutrition());
    this.router.navigate(['/user/winter-arc']);
  }
}
