import { Component, EventEmitter, Input, Output, forwardRef, ElementRef, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ]
})
export class TimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = 'Select Time...';
  @Input() disabled: boolean = false;

  @Output() timeChange = new EventEmitter<string | null>();

  private el = inject(ElementRef);

  showDropdown = false;
  selectedTime: string | null = null;

  // Time Picker State
  hours: number = 12;
  minutes: number = 0;
  period: 'AM' | 'PM' = 'AM';

  hoursInput: string = '12';
  minutesInput: string = '00';

  dropdownAlign: 'left' | 'right' = 'left';
  dropdownVerticalAlign: 'bottom' | 'top' = 'bottom';
  dropdownTop: string = '0px';
  dropdownBottom: string = 'auto';
  dropdownLeft: string = '0px';
  insideDrawer: boolean = false;

  private static openInstance: TimePickerComponent | null = null;

  ngOnInit() {
    this.insideDrawer = !!this.el.nativeElement.closest('.drawer-container, .step-pane');
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showDropdown && !this.el.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      if (TimePickerComponent.openInstance === this) {
        TimePickerComponent.openInstance = null;
      }
    }
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  toggleDropdown() {
    if (!this.disabled) {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        if (TimePickerComponent.openInstance && TimePickerComponent.openInstance !== this) {
          TimePickerComponent.openInstance.showDropdown = false;
        }
        TimePickerComponent.openInstance = this;
        this.updateTimeFromSelected();
        setTimeout(() => {
          this.adjustDropdownPosition();
        }, 0);
      } else {
        if (TimePickerComponent.openInstance === this) {
          TimePickerComponent.openInstance = null;
        }
      }
    }
  }

  adjustDropdownPosition() {
    if (this.insideDrawer) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const dropdownHeight = 220;
    const dropdownWidth = 290;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      this.dropdownVerticalAlign = 'top';
      this.dropdownTop = 'auto';
      this.dropdownBottom = `${window.innerHeight - rect.top + 8}px`;
    } else {
      this.dropdownVerticalAlign = 'bottom';
      this.dropdownTop = `${rect.bottom + 8}px`;
      this.dropdownBottom = 'auto';
    }

    const spaceRight = window.innerWidth - rect.left;

    if (spaceRight < dropdownWidth) {
      this.dropdownAlign = 'right';
      this.dropdownLeft = `${rect.right - dropdownWidth}px`;
    } else {
      this.dropdownAlign = 'left';
      this.dropdownLeft = `${rect.left}px`;
    }
  }

  updateTimeFromSelected() {
    if (this.selectedTime) {
      const [h, m] = this.selectedTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        this.period = h >= 12 ? 'PM' : 'AM';
        this.hours = h % 12 || 12;
        this.minutes = m;
      }
    } else {
      const now = new Date();
      let h = now.getHours();
      this.period = h >= 12 ? 'PM' : 'AM';
      this.hours = h % 12 || 12;
      this.minutes = Math.round(now.getMinutes() / 5) * 5;
      if (this.minutes === 60) {
        this.minutes = 0;
        this.hours = (this.hours % 12) + 1;
      }
    }
    this.hoursInput = this.hours.toString().padStart(2, '0');
    this.minutesInput = this.minutes.toString().padStart(2, '0');
  }

  incrementHours(event: Event) {
    event.stopPropagation();
    this.hours = this.hours === 12 ? 1 : this.hours + 1;
    this.hoursInput = this.hours.toString().padStart(2, '0');
  }

  decrementHours(event: Event) {
    event.stopPropagation();
    this.hours = this.hours === 1 ? 12 : this.hours - 1;
    this.hoursInput = this.hours.toString().padStart(2, '0');
  }

  incrementMinutes(event: Event) {
    event.stopPropagation();
    this.minutes = (this.minutes + 5) % 60;
    this.minutesInput = this.minutes.toString().padStart(2, '0');
  }

  decrementMinutes(event: Event) {
    event.stopPropagation();
    this.minutes = this.minutes === 0 ? 55 : this.minutes - 5;
    this.minutesInput = this.minutes.toString().padStart(2, '0');
  }

  togglePeriod(event: Event) {
    event.stopPropagation();
    this.period = this.period === 'AM' ? 'PM' : 'AM';
  }

  onHourInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let cleanVal = input.value.replace(/\D/g, '');
    this.hoursInput = cleanVal;

    if (cleanVal) {
      let num = parseInt(cleanVal, 10);
      if (num > 12) {
        num = 12;
        this.hoursInput = '12';
      }
      this.hours = num;
    }
  }

  onHourBlur() {
    if (!this.hours || this.hours < 1 || this.hours > 12) {
      this.hours = 12;
    }
    this.hoursInput = this.hours.toString().padStart(2, '0');
  }

  onMinuteInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let cleanVal = input.value.replace(/\D/g, '');
    this.minutesInput = cleanVal;

    if (cleanVal) {
      let num = parseInt(cleanVal, 10);
      if (num > 59) {
        num = 59;
        this.minutesInput = '59';
      }
      this.minutes = num;
    }
  }

  onMinuteBlur() {
    if (this.minutes === undefined || this.minutes === null || this.minutes < 0 || this.minutes > 59) {
      this.minutes = 0;
    }
    this.minutesInput = this.minutes.toString().padStart(2, '0');
  }

  applyTime(event: Event) {
    event.stopPropagation();

    this.onHourBlur();
    this.onMinuteBlur();

    let h = this.hours;
    if (this.period === 'PM' && h < 12) h += 12;
    if (this.period === 'AM' && h === 12) h = 0;

    const formattedTime = `${h.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
    this.selectedTime = formattedTime;

    this.showDropdown = false;
    if (TimePickerComponent.openInstance === this) {
      TimePickerComponent.openInstance = null;
    }
    this.onChange(this.selectedTime);
    this.timeChange.emit(this.selectedTime);
  }

  clearTime(event: Event) {
    event.stopPropagation();
    this.selectedTime = null;
    this.showDropdown = false;
    if (TimePickerComponent.openInstance === this) {
      TimePickerComponent.openInstance = null;
    }
    this.onChange(null);
    this.timeChange.emit(null);
  }

  get displayTime(): string {
    if (!this.selectedTime) return '';
    const [h, m] = this.selectedTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    const period = h >= 12 ? 'PM' : 'AM';
    const dispH = h % 12 || 12;
    return `${dispH}:${m.toString().padStart(2, '0')} ${period}`;
  }

  writeValue(value: any): void {
    if (value) {
      if (value.length > 5) {
        this.selectedTime = value.substring(0, 5);
      } else {
        this.selectedTime = value;
      }
    } else {
      this.selectedTime = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
