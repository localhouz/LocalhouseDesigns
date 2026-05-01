import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/nav/nav';
import { FooterComponent } from './shared/footer/footer';
import { ChatWidgetComponent } from './shared/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, FooterComponent, ChatWidgetComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-chat-widget />
  `,
  styles: [`
    main { min-height: 100vh; }
  `]
})
export class App {
  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      if (location.hostname === 'localhousedesigns.netlify.app') {
        location.replace('https://localhousedesigns.com' + location.pathname + location.search + location.hash);
      }
    }
  }
}
