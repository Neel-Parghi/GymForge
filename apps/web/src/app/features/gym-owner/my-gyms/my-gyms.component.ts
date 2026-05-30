declare var Razorpay: any;
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymService } from '../../../core/services/gym.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GymListResponse } from '../../../shared/models/gym.model';
import { Router } from '@angular/router';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { SlideDrawerComponent } from '../../../shared/components/slide-drawer/slide-drawer.component';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { PricingService } from '../../../core/services/pricing.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { PricingPlan } from '../../../shared/models/pricing.model';
import { StaffService } from '../../../core/services/staff.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';

@Component({
  selector: 'app-my-gyms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, DropdownComponent],
  templateUrl: './my-gyms.component.html',
  styleUrl: './my-gyms.component.scss',
})
export class MyGymsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gymService = inject(GymService);
  private toastService = inject(NotificationService);
  private router = inject(Router);
  private branchContextService = inject(BranchContextService);
  private fileUploadService = inject(FileUploadService);
  private pricingService = inject(PricingService);
  private paymentService = inject(PaymentService);
  private staffService = inject(StaffService);

  pricingPlans: PricingPlan[] = [];
  isUpgradeModalOpen = false;
  isProcessingPayment = false;
  selectedUpgradePlanId = '';

  activeTab: 'profile' | 'branches' | 'plan' = 'profile';

  profileForm!: FormGroup;
  branchForm!: FormGroup;
  isBranchDrawerOpen = false;
  isEditingBranch = false;
  selectedBranchId: string | null = null;
  isSavingBranch = false;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  gymData: GymListResponse | null = null;
  availableManagers: any[] = [];
  managerDropdownOptions: DropdownOption[] = [];
  branches: any[] = [];
  isLoadingBranches = false;

  ngOnInit(): void {
    this.initForm();
    this.loadGymData();
    this.loadPricingPlans();
    this.loadAvailableManagers();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      gymName: ['', [Validators.required]],
      brandName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      websiteUrl: [''],
      description: [''],
      gstNumber: [''],
      registrationNumber: [''],
      logoUrl: ['']
    });
    this.profileForm.disable();

    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      contactNumber: [''],
      openTime: [''],
      closeTime: [''],
      managerId: [''],
      address: this.fb.group({
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India'],
        postalCode: ['', Validators.required]
      })
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.profileForm.enable();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.profileForm.disable();
    if (this.gymData) {
      this.profileForm.patchValue(this.gymData);
    }
  }

  onLogoChange(event: Event): void {
    if (!this.isEditMode) return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isLoading = true;
      this.fileUploadService.uploadFile(file, 'logos').subscribe({
        next: (res) => {
          if (res.data?.url) {
            if (this.gymData) {
              this.gymData.logoUrl = res.data.url;
            }
            this.profileForm.patchValue({ logoUrl: res.data.url });
            this.profileForm.markAsDirty();
            this.toastService.success(CONSTANTS.GYM_MODULE.LOGO_UPLOAD_SUCCESS);
          }
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error(CONSTANTS.GYM_MODULE.LOGO_UPLOAD_ERROR);
          this.isLoading = false;
        }
      });
    }
  }

  private loadGymData(): void {
    this.isLoading = true;
    this.gymService.getMyGym().subscribe({
      next: (res) => {
        if (res.data) {
          this.gymData = res.data;
          this.profileForm.patchValue(res.data);
          if (this.gymData.id) {
            this.loadBranches(this.gymData.id);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error(CONSTANTS.GYM_MODULE.LOAD_DETAILS_ERROR);
        this.isLoading = false;
      }
    });
  }

  private loadBranches(gymId: string): void {
    this.isLoadingBranches = true;
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        this.branches = res.data || [];
        this.isLoadingBranches = false;
      },
      error: () => {
        this.toastService.error(CONSTANTS.GYM_MODULE.LOAD_BRANCHES_ERROR);
        this.isLoadingBranches = false;
      }
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.gymService.updateMyGym(this.profileForm.value).subscribe({
      next: () => {
        this.toastService.success(CONSTANTS.GYM_MODULE.UPDATE_SUCCESS);
        this.isSaving = false;
        this.isEditMode = false;
        this.profileForm.disable();

        if (this.gymData) {
          this.gymData = { ...this.gymData, ...this.profileForm.value };
        }
      },
      error: () => {
        this.toastService.error(CONSTANTS.GYM_MODULE.UPDATE_ERROR);
        this.isSaving = false;
      }
    });
  }

  openBranchDrawer(branch: any = null): void {
    if (branch) {
      this.isEditingBranch = true;
      this.selectedBranchId = branch.id;
      this.branchForm.patchValue({
        name: branch.name,
        contactNumber: branch.contactNumber,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        managerId: branch.managerId ? String(branch.managerId).toLowerCase() : '',
        address: {
          line1: branch.address?.line1,
          line2: branch.address?.line2,
          city: branch.address?.city,
          state: branch.address?.state,
          country: branch.address?.country || 'India',
          postalCode: branch.address?.postalCode
        }
      });
    } else {
      this.isEditingBranch = false;
      this.selectedBranchId = null;
      this.branchForm.reset({ address: { country: 'India' }, managerId: '' });
    }
    this.isBranchDrawerOpen = true;
  }

  closeBranchDrawer(): void {
    this.isBranchDrawerOpen = false;
    this.isEditingBranch = false;
    this.selectedBranchId = null;
    this.branchForm.reset({ address: { country: 'India' }, managerId: '' });
  }

  onSubmitBranch(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isSavingBranch = true;

    const saveObservable = this.isEditingBranch && this.selectedBranchId
      ? this.gymService.updateMyBranch(this.selectedBranchId, this.branchForm.value)
      : this.gymService.addMyBranch(this.branchForm.value);

    saveObservable.subscribe({
      next: () => {
        this.toastService.success(this.isEditingBranch ? CONSTANTS.GYM_MODULE.BRANCH_UPDATE_SUCCESS : CONSTANTS.GYM_MODULE.BRANCH_ADD_SUCCESS);
        this.isSavingBranch = false;
        this.closeBranchDrawer();
        if (this.gymData?.id) {
          this.loadBranches(this.gymData.id);
        }
      },
      error: () => {
        this.toastService.error(this.isEditingBranch ? CONSTANTS.GYM_MODULE.BRANCH_UPDATE_ERROR : CONSTANTS.GYM_MODULE.BRANCH_ADD_ERROR);
        this.isSavingBranch = false;
      }
    });
  }

  editBranch(branch: any): void {
    this.openBranchDrawer(branch);
  }

  manageBranch(branch: any): void {
    this.branchContextService.setActiveBranch({ id: branch.id, name: branch.name });
    this.router.navigate(['/gym-owner/dashboard']);
  }

  addBranch(): void {
    this.openBranchDrawer();
  }

  loadPricingPlans(): void {
    this.pricingService.getAllPlans().subscribe({
      next: (res) => {
        this.pricingPlans = res.data || [];
      }
    });
  }

  loadAvailableManagers(): void {
    this.staffService.getUnscopedGymStaff(1, 100).subscribe({
      next: (res) => {
        const staffList = res?.data?.items || [];
        this.availableManagers = staffList.filter((s: any) => s.role === 3 && s.isActive);
        this.managerDropdownOptions = [
          { label: 'No Manager Assigned (Pending Hire)', value: '' },
          ...this.availableManagers.map(m => ({
            label: `${m.firstName} ${m.lastName} (${m.staffNumber})`,
            value: String(m.id).toLowerCase()
          }))
        ];
      },
      error: () => {
        this.toastService.error(CONSTANTS.GYM_MODULE.LOAD_MANAGERS_ERROR);
      }
    });
  }

  openUpgradeModal(): void {
    this.isUpgradeModalOpen = true;
  }

  closeUpgradeModal(): void {
    this.isUpgradeModalOpen = false;
  }

  payForPlan(plan: PricingPlan): void {
    if (!this.gymData?.id) {
      this.toastService.error(CONSTANTS.GYM_MODULE.DETAILS_NOT_LOADED);
      return;
    }

    this.isProcessingPayment = true;
    this.selectedUpgradePlanId = plan.id;
    const request = {
      gymId: this.gymData.id,
      planId: plan.id
    };

    this.paymentService.initiatePayment(request).subscribe({
      next: (res: any) => {
        const options = {
          key: CONSTANTS.PAYMENT.RAZORPAY.KEY_ID,
          amount: res.data.transactionResponse.amount,
          currency: CONSTANTS.PAYMENT.RAZORPAY.CURRENCY,
          order_id: res.data.transactionResponse.razorpayOrderId,
          name: CONSTANTS.PAYMENT.RAZORPAY.COMPANY_NAME,
          description: `Upgrading to ${plan.name} Plan`,
          handler: (response: any) => {
            this.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          },
          prefill: {
            name: this.gymData?.ownerName || 'Gym Owner',
            email: this.gymData?.email || 'owner@example.com'
          },
          theme: { color: CONSTANTS.PAYMENT.RAZORPAY.THEME_COLOR },
          modal: {
            ondismiss: () => {
              this.isProcessingPayment = false;
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      },
      error: () => {
        this.toastService.error(CONSTANTS.GYM_MODULE.INIT_SUBSCRIPTION_ERROR);
        this.isProcessingPayment = false;
      }
    });
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): void {
    this.paymentService.verifyPayment({
      orderId,
      paymentId,
      signature
    }).subscribe({
      next: () => {
        this.toastService.success(CONSTANTS.GYM_MODULE.PAYMENT_UPGRADE_SUCCESS);
        this.isUpgradeModalOpen = false;
        this.isProcessingPayment = false;
        this.loadGymData();
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Payment verification failed.';
        this.toastService.error(msg);
        this.isProcessingPayment = false;
      }
    });
  }
}
