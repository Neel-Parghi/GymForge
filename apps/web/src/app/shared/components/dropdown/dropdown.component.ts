import { Component, EventEmitter, Input, Output, forwardRef, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownOption } from '../../models/dropdown.model';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() disabled: boolean = false;
  @Input() value: any;
  @Input() align: 'left' | 'right' = 'left';
  @Input() direction: 'up' | 'down' | 'auto' = 'down';
  @Input() minWidth: string = '150px';

  @Output() selectionChange = new EventEmitter<any>();

  private el = inject(ElementRef);
  isOpen = false;
  actualDirection: 'up' | 'down' = 'down';

  onChange: any = () => { };
  onTouched: any = () => { };

  toggleDropdown() {
    if (!this.disabled) {
      if (!this.isOpen) {
        this.updateDirection();
        setTimeout(() => this.ensureVisibility(), 50);
      }
      this.isOpen = !this.isOpen;
    }
  }

  private ensureVisibility() {
    if (this.isOpen && this.actualDirection === 'down') {
      this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  updateDirection() {
    if (this.direction !== 'auto') {
      this.actualDirection = this.direction;
      return;
    }

    const rect = this.el.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      this.actualDirection = 'up';
    } else {
      this.actualDirection = 'down';
    }
  }

  selectOption(option: DropdownOption) {
    this.value = option.value;
    this.isOpen = false;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(this.value);
  }

  getSelectedLabel(): string {
    const option = this.options.find(o => o.value === this.value);
    return option ? option.label : this.placeholder;
  }

  getSelectedIcon(): string | undefined {
    const option = this.options.find(o => o.value === this.value);
    return option?.icon;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
