import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../../../../core/services/template.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { RouterModule } from '@angular/router';
import { DataGrid, GridCellDirective } from '../../../../shared/components/data-grid/data-grid.component';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { CONSTANTS } from '../../../../core/constants/constants';
import { TEMPLATE_CONFIG, TEMPLATE_TYPES } from '../../../../core/constants/template-config';

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
  private confirmationService = inject(ConfirmationService);

  templates: any[] = [];
  templateForm: FormGroup;
  isSubmitting = false;
  isDrawerOpen = false;
  editingTemplateId: string | null = null;

  gridConfig = AppGridConfig['Templates'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  templateTypes = TEMPLATE_TYPES;

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
      const config = TEMPLATE_CONFIG[type];
      if (config) {
        this.templateForm.patchValue({
          name: this.templateForm.get('name')?.value || config.defaultName,
          titleTemplate: config.titleTemplate,
          messageTemplate: config.messageTemplate
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
    this.confirmationService.confirm({
      title: 'Delete Template',
      message: 'Are you sure you want to delete this notification template? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
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
    });
  }

  testTemplate(id: string): void {
    this.templateService.testTemplate(id).subscribe({
      next: () => {
        this.notificationService.success('Test notification sent to your email and portal!');
      },
      error: () => {
        this.notificationService.error('Failed to send test notification');
      }
    });
  }

  getTemplateTypeName(type: number): string {
    return this.templateTypes.find(t => t.value === type)?.label || 'Unknown';
  }
}
