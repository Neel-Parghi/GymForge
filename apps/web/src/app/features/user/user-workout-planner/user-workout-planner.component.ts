import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlannerComponent } from '../../trainer/workout-planner/workout-planner.component';

@Component({
  selector: 'app-user-workout-planner',
  standalone: true,
  imports: [CommonModule, WorkoutPlannerComponent],
  templateUrl: './user-workout-planner.component.html',
  styleUrl: './user-workout-planner.component.scss'
})
export class UserWorkoutPlannerComponent { }
