import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid.component';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DataGrid, FilterBarComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  gridConfig = AppGridConfig['StandaloneUsers'];

  displayData: any[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  searchQuery: string = '';

  private userService = inject(UserService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getStandaloneUsers(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        let items = res.data?.items || [];

        this.displayData = items.map((u: any) => {
          return {
            ...u,
            status: u.deletionRequestedOn ? 'Deletion Scheduled' : 'Active'
          };
        });

        this.totalItems = res.data?.totalCount || 0;
      },
      error: (err: any) => {
        this.notification.error(err.error?.message || 'Error loading users.');
      }
    });
  }

  onFilterChanged(filters: any) {
    this.searchQuery = filters.search || '';
    this.currentPage = 1;
    this.getUsers();
  }

  onPageChanged(page: number) {
    this.currentPage = page;
    this.getUsers();
  }

  onPageSizeChanged(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getUsers();
  }
}
