import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { BottomNavTab, MemberNavTabId, QuickLogAction } from '../../core/models/member-nav.model';

@Component({
  selector: 'app-user-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-bottom-nav.component.html',
  styleUrl: './user-bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBottomNavComponent {
  private router = inject(Router);

  readonly tabs: BottomNavTab[] = [
    { id: 'home', label: 'Home', icon: 'fa-solid fa-house', route: '/user/dashboard', matches: ['/user/dashboard'] },
    {
      id: 'train', label: 'Train', icon: 'fa-solid fa-dumbbell', route: '/user/workout-planner',
      matches: ['/user/workout-planner', '/user/workout-calendar', '/user/performance', '/user/exercise-progress']
    },
    { id: 'eat', label: 'Eat', icon: 'fa-solid fa-utensils', route: '/user/diet-tracker', matches: ['/user/diet-tracker', '/user/diet-planner'] },
    {
      id: 'me', label: 'Me', icon: 'fa-solid fa-user', route: '/user/profile',
      matches: ['/user/profile', '/user/settings', '/user/billing', '/user/health-tracker']
    }
  ];

  readonly logActions: QuickLogAction[] = [
    { label: 'Log a meal', hint: 'Plan meals or anything extra', icon: 'fa-solid fa-utensils', tone: 'energy', route: '/user/diet-tracker' },
    { label: 'Log weight', hint: 'Weight and body fat', icon: 'fa-solid fa-weight-scale', tone: 'info', route: '/user/health-tracker' },
    { label: 'Workout calendar', hint: 'Log a past session', icon: 'fa-solid fa-calendar-days', tone: 'good', route: '/user/workout-calendar' },
    { label: 'Daily routines', hint: 'Tick off today’s habits', icon: 'fa-solid fa-list-check', tone: 'warn', route: '/user/dashboard' }
  ];

  readonly isLogOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly activeTab = computed<MemberNavTabId | null>(() => {
    const url = this.currentUrl();
    return this.tabs.find(t => t.matches.some(m => url.startsWith(m)))?.id ?? null;
  });

  /** The live workout screen is a focus view with its own action bar, so the nav steps aside. */
  readonly hidden = computed(() => this.currentUrl().startsWith('/user/performance'));

  toggleLog(): void {
    this.isLogOpen.update(open => !open);
  }

  closeLog(): void {
    this.isLogOpen.set(false);
  }

  go(route: string): void {
    this.closeLog();
    this.router.navigateByUrl(route);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLog();
  }
}
