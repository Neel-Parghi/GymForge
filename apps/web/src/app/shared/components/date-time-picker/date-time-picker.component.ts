import { Component, EventEmitter, Input, Output, forwardRef, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay } from '../../models/attendance.model';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = 'Select Date...';
  @Input() disabled: boolean = false;
  @Input() enableTime: boolean = false;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  @Output() dateChange = new EventEmitter<Date | null>();

  private el = inject(ElementRef);

  showCalendarDropdown = false;
  selectedDate: Date | null = null;
  currentViewDate: Date = new Date();
  calendarDays: CalendarDay[] = [];

  // Month & Year Picker States
  currentPickerView: 'days' | 'months' | 'years' = 'days';
  startYearRange: number = 0;

  readonly monthsList = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Time Picker State
  hours: number = 12;
  minutes: number = 0;
  period: 'AM' | 'PM' = 'AM';

  dropdownAlign: 'left' | 'right' = 'left';
  dropdownVerticalAlign: 'bottom' | 'top' = 'bottom';
  dropdownTop: string = '0px';
  dropdownLeft: string = '0px';
  insideDrawer: boolean = false;

  ngOnInit() {
    // Check if picker component is rendered inside a drawer
    this.insideDrawer = !!this.el.nativeElement.closest('.drawer-container');
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  toggleCalendar() {
    if (!this.disabled) {
      this.showCalendarDropdown = !this.showCalendarDropdown;
      if (this.showCalendarDropdown) {
        this.currentViewDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
        this.currentPickerView = 'days';
        this.updateTimeFromSelectedDate();
        this.generateCalendarDays();

        setTimeout(() => {
          this.adjustDropdownPosition();
        }, 0);
      }
    }
  }

  adjustDropdownPosition() {
    const triggerEl = this.el.nativeElement.querySelector('.calendar-trigger');
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();

      // Horizontal positioning
      const spaceRight = window.innerWidth - rect.left;
      if (spaceRight < 300) {
        this.dropdownAlign = 'right';
        this.dropdownLeft = `${rect.right - 290}px`;
      } else {
        this.dropdownAlign = 'left';
        this.dropdownLeft = `${rect.left}px`;
      }

      // Vertical positioning
      const dropdownHeight = this.enableTime ? 435 : 290;
      const spaceBottom = window.innerHeight - rect.bottom;

      if (spaceBottom < dropdownHeight + 10 && rect.top > dropdownHeight + 10) {
        this.dropdownVerticalAlign = 'top';
        this.dropdownTop = `${rect.top - dropdownHeight - 8}px`;
      } else {
        this.dropdownVerticalAlign = 'bottom';
        this.dropdownTop = `${rect.bottom + 8}px`;
      }
    }
  }

  generateCalendarDays(): void {
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        dayNumber: prevMonthTotalDays - i,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: this.selectedDate ? this.isSameDay(d, this.selectedDate) : false
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(d, today),
        isSelected: this.selectedDate ? this.isSameDay(d, this.selectedDate) : false
      });
    }

    // Leading days from next month
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: this.selectedDate ? this.isSameDay(d, this.selectedDate) : false
      });
    }

    this.calendarDays = days;
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    const currentMonth = this.currentViewDate.getMonth();
    this.currentViewDate = new Date(this.currentViewDate.getFullYear(), currentMonth - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    const currentMonth = this.currentViewDate.getMonth();
    this.currentViewDate = new Date(this.currentViewDate.getFullYear(), currentMonth + 1, 1);
    this.generateCalendarDays();
  }

  showMonthView(event: MouseEvent) {
    event.stopPropagation();
    this.currentPickerView = 'months';
  }

  showYearView(event: MouseEvent) {
    event.stopPropagation();
    this.currentPickerView = 'years';
    const currentYear = this.currentViewDate.getFullYear();
    // Center the year in a 16-year block
    this.startYearRange = currentYear - (currentYear % 16);
  }

  selectMonth(monthIndex: number, event: MouseEvent) {
    event.stopPropagation();
    const currentYear = this.currentViewDate.getFullYear();
    const currentDay = Math.min(this.currentViewDate.getDate(), new Date(currentYear, monthIndex + 1, 0).getDate());
    this.currentViewDate = new Date(currentYear, monthIndex, currentDay);
    this.generateCalendarDays();
    this.currentPickerView = 'days';
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    const currentMonth = this.currentViewDate.getMonth();
    const currentDay = Math.min(this.currentViewDate.getDate(), new Date(year, currentMonth + 1, 0).getDate());
    this.currentViewDate = new Date(year, currentMonth, currentDay);
    this.generateCalendarDays();
    this.currentPickerView = 'months';
  }

  prevYear(event: MouseEvent): void {
    event.stopPropagation();
    this.currentViewDate = new Date(this.currentViewDate.getFullYear() - 1, this.currentViewDate.getMonth(), 1);
  }

  nextYear(event: MouseEvent): void {
    event.stopPropagation();
    this.currentViewDate = new Date(this.currentViewDate.getFullYear() + 1, this.currentViewDate.getMonth(), 1);
  }

  prevYearRange(event: MouseEvent) {
    event.stopPropagation();
    this.startYearRange -= 16;
  }

  nextYearRange(event: MouseEvent) {
    event.stopPropagation();
    this.startYearRange += 16;
  }

  getYearsRangeList(): number[] {
    const years = [];
    for (let i = 0; i < 16; i++) {
      years.push(this.startYearRange + i);
    }
    return years;
  }

  selectDate(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();

    const d = new Date(day.date);

    if (this.enableTime) {
      let hr = this.hours;
      if (this.period === 'PM' && hr < 12) hr += 12;
      if (this.period === 'AM' && hr === 12) hr = 0;
      d.setHours(hr, this.minutes, 0, 0);
    }

    this.selectedDate = d;
    this.generateCalendarDays();

    if (!this.enableTime) {
      this.showCalendarDropdown = false;
      this.onChange(this.selectedDate);
      this.onTouched();
      this.dateChange.emit(this.selectedDate);
    }
  }

  incrementHours(event: MouseEvent) {
    event.stopPropagation();
    this.hours = this.hours === 12 ? 1 : this.hours + 1;
  }

  decrementHours(event: MouseEvent) {
    event.stopPropagation();
    this.hours = this.hours === 1 ? 12 : this.hours - 1;
  }

  incrementMinutes(event: MouseEvent) {
    event.stopPropagation();
    this.minutes = (this.minutes + 5) % 60;
  }

  decrementMinutes(event: MouseEvent) {
    event.stopPropagation();
    this.minutes = this.minutes === 0 ? 55 : (this.minutes - 5) % 60;
  }

  togglePeriod(event: MouseEvent) {
    event.stopPropagation();
    this.period = this.period === 'AM' ? 'PM' : 'AM';
  }

  applyTime(event: MouseEvent) {
    event.stopPropagation();
    if (!this.selectedDate) {
      this.selectedDate = new Date();
    }

    let hr = this.hours;
    if (this.period === 'PM' && hr < 12) hr += 12;
    if (this.period === 'AM' && hr === 12) hr = 0;

    this.selectedDate.setHours(hr, this.minutes, 0, 0);

    this.showCalendarDropdown = false;
    this.onChange(this.selectedDate);
    this.onTouched();
    this.dateChange.emit(this.selectedDate);
  }

  clearDate(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedDate = null;
    this.showCalendarDropdown = false;
    this.onChange(null);
    this.onTouched();
    this.dateChange.emit(null);
  }

  getCurrentMonthYearLabel(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[this.currentViewDate.getMonth()]} ${this.currentViewDate.getFullYear()}`;
  }

  updateTimeFromSelectedDate() {
    if (this.selectedDate) {
      const hr = this.selectedDate.getHours();
      this.minutes = this.selectedDate.getMinutes();
      if (hr >= 12) {
        this.period = 'PM';
        this.hours = hr === 12 ? 12 : hr - 12;
      } else {
        this.period = 'AM';
        this.hours = hr === 0 ? 12 : hr;
      }
    } else {
      const now = new Date();
      const hr = now.getHours();
      this.minutes = now.getMinutes();
      if (hr >= 12) {
        this.period = 'PM';
        this.hours = hr === 12 ? 12 : hr - 12;
      } else {
        this.period = 'AM';
        this.hours = hr === 0 ? 12 : hr;
      }
    }
  }

  writeValue(value: any): void {
    if (value) {
      this.selectedDate = value instanceof Date ? value : new Date(value);
      this.currentViewDate = new Date(this.selectedDate);
      this.updateTimeFromSelectedDate();
    } else {
      this.selectedDate = null;
    }
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