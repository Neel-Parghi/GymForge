import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlannerComponent } from '../../trainer/workout-planner/workout-planner.component';

@Component({
  selector: 'app-user-workout-planner',
  standalone: true,
  imports: [CommonModule, WorkoutPlannerComponent],
  templateUrl: './user-workout-planner.html',
  styleUrl: './user-workout-planner.scss'
})
export class UserWorkoutPlanner { }
