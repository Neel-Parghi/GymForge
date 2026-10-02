import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { WinterArcStore } from './winter-arc.store';

/** Home and planner need a joined arc; until then members land on the join screen. */
const joinedGuard: CanActivateFn = () =>
  inject(WinterArcStore).joined() || inject(Router).createUrlTree(['/user/winter-arc/join']);

export const WINTER_ARC_ROUTES: Routes = [
  {
    path: '',
    providers: [WinterArcStore],
    children: [
      {
        path: '',
        canActivate: [joinedGuard],
        loadComponent: () => import('./arc-home/arc-home.component').then(m => m.ArcHomeComponent)
      },
      {
        path: 'join',
        loadComponent: () => import('./arc-join/arc-join.component').then(m => m.ArcJoinComponent)
      },
      {
        path: 'planner',
        canActivate: [joinedGuard],
        loadComponent: () => import('./arc-planner/arc-planner.component').then(m => m.ArcPlannerComponent)
      }
    ]
  }
];
