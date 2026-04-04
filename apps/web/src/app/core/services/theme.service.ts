import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme: 'light' | 'dark' = 'light';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme('dark');
      }
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme() {
    return this.theme;
  }
}
