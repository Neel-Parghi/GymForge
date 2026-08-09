import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  WorkoutPlan,
  SplitPlanner,
  WeeklyPlanner
} from '../../../../../shared/models/workout-plan.model';

@Component({
  selector: 'app-timetable-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timetable-modal.component.html',
  styleUrl: './timetable-modal.component.scss'
})
export class TimetableModalComponent implements OnInit {
  @Input() planner: WorkoutPlan | null = null;
  @Input() type: 'split' | 'weekly' | 'daily' = 'split';
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() plannerChanged = new EventEmitter<void>();

  activeDetailDayName = '';
  draggedDayIdx: number | null = null;
  draggedExIdx: number | null = null;
  openNoteIndices = new Set<number>();

  get tabs(): any[] {
    if (!this.planner) return [];
    if (this.type === 'split' || this.type === 'daily') {
      return (this.planner as SplitPlanner).days || [];
    } else {
      return (this.planner as WeeklyPlanner).calendar || [];
    }
  }

  onDayDragStart(index: number, event: DragEvent): void {
    this.draggedDayIdx = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDayDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
  }

  onDayDrop(targetIdx: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedDayIdx === null || this.draggedDayIdx === targetIdx || !this.planner) return;

    if (this.type === 'split' || this.type === 'daily') {
      const p = this.planner as SplitPlanner;
      const temp = p.days[this.draggedDayIdx];
      p.days[this.draggedDayIdx] = p.days[targetIdx];
      p.days[targetIdx] = temp;
      this.activeDetailDayName = p.days[targetIdx].name;
    } else {
      const p = this.planner as WeeklyPlanner;
      const day1 = p.calendar[this.draggedDayIdx];
      const day2 = p.calendar[targetIdx];

      const temp = {
        type: day1.type,
        targetCategory: day1.targetCategory,
        splitDayName: day1.splitDayName,
        exercises: day1.exercises ? [...day1.exercises] : []
      };

      day1.type = day2.type;
      day1.targetCategory = day2.targetCategory;
      day1.splitDayName = day2.splitDayName;
      day1.exercises = day2.exercises ? [...day2.exercises] : [];

      day2.type = temp.type;
      day2.targetCategory = temp.targetCategory;
      day2.splitDayName = temp.splitDayName;
      day2.exercises = temp.exercises;

      this.activeDetailDayName = day2.dayName;
    }

    this.draggedDayIdx = null;
    this.plannerChanged.emit();
  }

  onExDragStart(index: number, event: DragEvent): void {
    this.draggedExIdx = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onExDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
  }

  onExDrop(targetIdx: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedExIdx === null || this.draggedExIdx === targetIdx) return;

    const dayDetails = this.getSelectedDayDetails();
    if (!dayDetails || !dayDetails.exercises) return;

    const [removed] = dayDetails.exercises.splice(this.draggedExIdx, 1);
    dayDetails.exercises.splice(targetIdx, 0, removed);

    this.openNoteIndices.clear();
    this.draggedExIdx = null;
    this.plannerChanged.emit();
  }

  ngOnInit(): void {
    if (this.planner) {
      if (this.type === 'split') {
        const p = this.planner as SplitPlanner;
        this.activeDetailDayName = p.days[0]?.name || 'Day 1';
      } else if (this.type === 'daily') {
        const p = this.planner as SplitPlanner;
        this.activeDetailDayName = p.days[0]?.name || 'Workout Session';
      } else {
        const p = this.planner as WeeklyPlanner;
        const firstWorkout = p.calendar.find((c: any) => c.type === 'workout');
        this.activeDetailDayName = firstWorkout ? firstWorkout.dayName : p.calendar[0]?.dayName || 'Monday';
      }
    }
  }

  setDetailActiveDay(dayName: string): void {
    this.activeDetailDayName = dayName;
    this.openNoteIndices.clear();
  }

  toggleNote(idx: number, event: Event): void {
    event.stopPropagation();
    if (this.openNoteIndices.has(idx)) {
      this.openNoteIndices.delete(idx);
    } else {
      this.openNoteIndices.add(idx);
    }
  }

  isNoteOpen(idx: number): boolean {
    return this.openNoteIndices.has(idx);
  }

  getSelectedDayDetails(): any {
    if (!this.planner) return null;
    if (this.type === 'split' || this.type === 'daily') {
      const p = this.planner as SplitPlanner;
      return p.days.find((d: any) => d.name === this.activeDetailDayName);
    } else {
      const p = this.planner as WeeklyPlanner;
      return p.calendar.find((c: any) => c.dayName === this.activeDetailDayName);
    }
  }

  getCategoryIcon(category: string): string {
    switch (category?.toLowerCase()) {
      case 'chest': return 'fa-dumbbell';
      case 'back': return 'fa-angles-up';
      case 'shoulders': return 'fa-arrows-up-to-line';
      case 'legs': return 'fa-shoe-prints';
      case 'biceps': return 'fa-hand-fist';
      case 'triceps': return 'fa-hand-fist';
      case 'core': return 'fa-shield-halved';
      case 'cardio': return 'fa-person-running';
      default: return 'fa-dumbbell';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }
}
