import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  show(): void {
    this.loadingCount++;
    this.updateState();
  }

  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    this.updateState();
  }

  private updateState(): void {
    this.isLoadingSubject.next(this.loadingCount > 0);
  }
}
