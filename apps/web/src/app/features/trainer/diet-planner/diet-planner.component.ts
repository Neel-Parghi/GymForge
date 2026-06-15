import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietLibraryComponent } from '../../../shared/components/diet-library/diet-library.component';

@Component({
  selector: 'app-diet-planner',
  standalone: true,
  imports: [CommonModule, DietLibraryComponent],
  templateUrl: './diet-planner.component.html',
  styleUrl: './diet-planner.component.scss'
})
export class PTDietPlannerComponent {}
