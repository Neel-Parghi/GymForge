import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Set on requests whose screen shows its own loading state, so the full-page overlay stays hidden. */
export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

export const withoutGlobalLoading = (): HttpContext => new HttpContext().set(SKIP_GLOBAL_LOADING, true);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const skipLoading = req.context.get(SKIP_GLOBAL_LOADING) || req.headers.has('X-Skip-Loading');

  if (!skipLoading) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    })
  );
};
