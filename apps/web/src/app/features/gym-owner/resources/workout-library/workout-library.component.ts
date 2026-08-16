import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutPlannerComponent } from '../../../trainer/workout-planner/workout-planner.component';
import { MemberPickerModalComponent } from '../../../../shared/components/member-picker-modal/member-picker-modal.component';
import { MemberService } from '../../../../core/services/member.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { GymMember } from '../../../../shared/models/member.model';

@Component({
  selector: 'app-gym-owner-workout-library',
  standalone: true,
  imports: [CommonModule, WorkoutPlannerComponent, MemberPickerModalComponent],
  templateUrl: './workout-library.component.html',
  styleUrl: './workout-library.component.scss'
})
export class GymOwnerWorkoutLibraryComponent {
  private memberService = inject(MemberService);
  private notification = inject(NotificationService);

  showPicker = false;
  selectedPlan: any = null;

  onAssign(plan: any): void {
    this.selectedPlan = plan;
    this.showPicker = true;
  }

  closePicker(): void {
    this.showPicker = false;
    this.selectedPlan = null;
  }

  onMemberSelected(member: GymMember): void {
    if (!this.selectedPlan?.id) return;

    this.memberService.assignPlan(member.id, this.selectedPlan.id).subscribe({
      next: () => {
        this.notification.success(`"${this.selectedPlan.name}" assigned to ${member.firstName} ${member.lastName}`);
        this.closePicker();
      },
      error: () => {
        this.notification.error('Failed to assign workout plan. Please try again.');
      }
    });
  }
}
