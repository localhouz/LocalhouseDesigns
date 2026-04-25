import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class NavComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  scrolled = signal(false);
  menuOpen = signal(false);
  isHome = signal(true);

  constructor() {
    this.updateRoute(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        this.updateRoute(event.urlAfterRedirects);
        this.closeMenu();
      });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }

  private updateRoute(url: string) {
    const path = url.split('?')[0].split('#')[0];
    this.isHome.set(path === '/' || path === '');
  }
}
