import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FilterConfig, } from '../../models/filter.model';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() debounce: number = 300;
  @Output() filterChanged = new EventEmitter<any>();

  searchControl = new FormControl('');
  filterControls: { [key: string]: FormControl } = {};

  private destroy$ = new Subject<void>();

  get isFiltering(): boolean {
    if (this.searchControl.value) return true;
    return Object.values(this.filterControls).some(ctrl => ctrl.value !== '');
  }

  ngOnInit(): void {
    this.filterConfigs.forEach(config => {
      this.filterControls[config.key] = new FormControl('');
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.emitFilterChange();
    });
  }

  onSearch(): void {
  }

  onFilterChange(): void {
    this.emitFilterChange();
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    Object.values(this.filterControls).forEach(ctrl => {
      ctrl.setValue('', { emitEvent: false });
    });
    this.emitFilterChange();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  private emitFilterChange(): void {
    const filterValues: any = {
      search: this.searchControl.value
    };

    Object.keys(this.filterControls).forEach(key => {
      filterValues[key] = this.filterControls[key].value;
    });

    this.filterChanged.emit(filterValues);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
