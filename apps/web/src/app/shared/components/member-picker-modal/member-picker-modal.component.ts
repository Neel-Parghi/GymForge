import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MemberService } from '../../../core/services/member.service';
import { GymMember } from '../../models/member.model';

@Component({
  selector: 'app-member-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-picker-modal.component.html',
  styleUrl: './member-picker-modal.component.scss'
})
export class MemberPickerModalComponent implements OnChanges {
  private memberService = inject(MemberService);

  @Input() isOpen = false;
  @Input() planName = '';
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<GymMember>();

  members: GymMember[] = [];
  loading = false;
  searchTerm = '';
  private searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.loadMembers(term));
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.searchTerm = '';
      this.loadMembers('');
    }
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  loadMembers(search: string): void {
    this.loading = true;
    this.memberService.getGymMembers(1, 50, search, 'all', 'all', 'all', false, true).subscribe({
      next: (res) => {
        this.members = res?.data?.items || [];
        this.loading = false;
      },
      error: () => {
        this.members = [];
        this.loading = false;
      }
    });
  }

  onSelect(member: GymMember): void {
    this.select.emit(member);
  }

  onClose(): void {
    this.close.emit();
  }
}
