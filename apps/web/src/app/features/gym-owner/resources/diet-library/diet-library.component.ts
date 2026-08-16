import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietLibraryComponent } from '../../../../shared/components/diet-library/diet-library.component';
import { MemberPickerModalComponent } from '../../../../shared/components/member-picker-modal/member-picker-modal.component';
import { MemberService } from '../../../../core/services/member.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { GymMember } from '../../../../shared/models/member.model';

@Component({
  selector: 'app-gym-owner-diet-library',
  standalone: true,
  imports: [CommonModule, DietLibraryComponent, MemberPickerModalComponent],
  templateUrl: './diet-library.component.html',
  styleUrl: './diet-library.component.scss'
})
export class GymOwnerDietLibraryComponent {
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

    this.memberService.assignDiet(member.id, this.selectedPlan.id).subscribe({
      next: () => {
        this.notification.success(`"${this.selectedPlan.name}" assigned to ${member.firstName} ${member.lastName}`);
        this.closePicker();
      },
      error: () => {
        this.notification.error('Failed to assign diet plan. Please try again.');
      }
    });
  }
}
