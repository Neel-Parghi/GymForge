import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BranchContext } from '../models/branch-context.model';

@Injectable({
  providedIn: 'root'
})
export class BranchContextService {
  private readonly STORAGE_KEY = 'gf_active_branch';

  private activeBranchSubject = new BehaviorSubject<BranchContext | null>(this.getStoredBranch());
  activeBranch$ = this.activeBranchSubject.asObservable();

  constructor() { }

  private getStoredBranch(): BranchContext | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  setActiveBranch(branch: BranchContext | null): void {
    if (branch) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(branch));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.activeBranchSubject.next(branch);
  }

  getActiveBranchId(): string | null {
    return this.activeBranchSubject.value?.id || null;
  }
}
