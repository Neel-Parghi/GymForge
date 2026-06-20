import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../../../../core/services/template.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RouterModule } from '@angular/router';
import { DataGrid, GridCellDirective } from '../../../../shared/components/data-grid/data-grid.component';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { CONSTANTS } from '../../../../core/constants/constants';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DataGrid, GridCellDirective, SlideDrawerComponent, DropdownComponent],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates implements OnInit {
  private fb = inject(FormBuilder);
  private templateService = inject(TemplateService);
  private notificationService = inject(NotificationService);

  templates: any[] = [];
  templateForm: FormGroup;
  isSubmitting = false;
  isDrawerOpen = false;
  editingTemplateId: string | null = null;

  gridConfig = AppGridConfig['Templates'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  templateTypes = [
    { value: 0, label: 'Custom' },
    { value: 1, label: 'Inactivity Notification' },
    { value: 2, label: 'Expired Membership' },
    { value: 3, label: 'Expiring Soon' }
  ];

  constructor() {
    this.templateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: [0, Validators.required],
      titleTemplate: ['', [Validators.required, Validators.maxLength(100)]],
      messageTemplate: ['', [Validators.required, Validators.maxLength(1000)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.setupFormListeners();
    this.loadTemplates();
  }

  setupFormListeners(): void {
    this.templateForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 1) { // Inactivity Notification
        this.templateForm.patchValue({
          name: this.templateForm.get('name')?.value || 'Inactivity Follow-up',
          titleTemplate: 'We miss you at {{GymName}}, {{UserName}}! 💪',
          messageTemplate: 'Hi {{UserName}},\n\nWe noticed you haven\'t been to the gym in a while. We miss your energy! Let us know if you need any help getting back on track with your fitness goals.\n\nSee you soon,\nThe {{GymName}} Team'
        });
      } else if (type === 2) { // Expired Membership
        this.templateForm.patchValue({
          name: this.templateForm.get('name')?.value || 'Membership Expired',
          titleTemplate: 'Your {{GymName}} membership has expired ⚠️',
          messageTemplate: 'Hi {{UserName}},\n\nYour {{PlanName}} membership expired on {{ExpiryDate}}. We\'d love to welcome you back! Renew today to continue your fitness journey with us.\n\nThanks,\nThe {{GymName}} Team'
        });
      } else if (type === 3) { // Expiring Soon
        this.templateForm.patchValue({
          name: this.templateForm.get('name')?.value || 'Membership Expiring Soon',
          titleTemplate: 'Your {{GymName}} membership expires soon! ⏳',
          messageTemplate: 'Hi {{UserName}},\n\nJust a quick reminder that your {{PlanName}} membership is expiring on {{ExpiryDate}}. Don\'t lose your momentum! Renew today to keep crushing your goals.\n\nThanks,\nThe {{GymName}} Team'
        });
      }
    });
  }

  loadTemplates(): void {
    this.templateService.getTemplates().subscribe({
      next: (res) => {
        this.templates = res.data || [];
        this.templates = this.templates.map(t => ({
          ...t,
          typeLabel: this.getTemplateTypeName(t.type)
        }));
        this.totalItems = this.templates.length;
      },
      error: (err) => {
        this.notificationService.error('Failed to load templates');
        console.error(err);
      }
    });
  }

  openDrawer(template: any = null): void {
    if (template) {
      this.editingTemplateId = template.id;
      this.templateForm.patchValue({
        name: template.name,
        type: template.type,
        titleTemplate: template.titleTemplate,
        messageTemplate: template.messageTemplate,
        isActive: template.isActive
      }, { emitEvent: false });
    } else {
      this.editingTemplateId = null;
      this.templateForm.reset({ type: 0, isActive: true }, { emitEvent: false });
    }
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  insertVariable(variable: string, field: string): void {
    const control = this.templateForm.get(field);
    if (control) {
      const currentValue = control.value || '';
      control.setValue(`${currentValue} {{${variable}}}`);
    }
  }

  onSubmit(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const request = this.templateForm.value;

    if (this.editingTemplateId) {
      this.templateService.updateTemplate(this.editingTemplateId, request).subscribe({
        next: (res) => {
          this.notificationService.success('Template updated successfully!');
          this.loadTemplates();
          this.closeDrawer();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.notificationService.error('Failed to update template');
          this.isSubmitting = false;
        }
      });
    } else {
      this.templateService.createTemplate(request).subscribe({
        next: (res) => {
          this.notificationService.success('Template created successfully!');
          this.loadTemplates();
          this.closeDrawer();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.notificationService.error('Failed to create template');
          this.isSubmitting = false;
        }
      });
    }
  }

  onAction(event: { action: string, row: any }): void {
    if (event.action === CONSTANTS.ACTIONS.EDIT) {
      this.openDrawer(event.row);
    } else if (event.action === CONSTANTS.ACTIONS.DELETE) {
      this.deleteTemplate(event.row.id);
    }
  }

  onPageChanged(page: number) {
    this.currentPage = page;
  }

  onPageSizeChanged(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  deleteTemplate(id: string): void {
    if (confirm('Are you sure you want to delete this template?')) {
      this.templateService.deleteTemplate(id).subscribe({
        next: () => {
          this.notificationService.success('Template deleted');
          this.loadTemplates();
        },
        error: (err) => {
          this.notificationService.error('Failed to delete template');
        }
      });
    }
  }

  getTemplateTypeName(type: number): string {
    return this.templateTypes.find(t => t.value === type)?.label || 'Unknown';
  }
}
