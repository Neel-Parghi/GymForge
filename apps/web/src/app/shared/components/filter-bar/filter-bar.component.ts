import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() filterConfigs: FilterConfig[] = [];
  @Output() filterChanged = new EventEmitter<any>();

  searchControl = new FormControl('');
  filterControls: { [key: string]: FormControl } = {};
  
  private destroy$ = new Subject<void>();

  get isFiltering(): boolean {
    if (this.searchControl.value) return true;
    return Object.values(this.filterControls).some(ctrl => ctrl.value !== '');
  }

  ngOnInit(): void {
    // Initialize filter controls based on configs
    this.filterConfigs.forEach(config => {
      this.filterControls[config.key] = new FormControl('');
    });

    // Handle search debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.emitFilterChange();
    });
  }

  onSearch(): void {
    // Immediate search trigger is handled by debounce in ngOnInit
    // but we can add immediate logic here if needed for small datasets
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
