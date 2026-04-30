import { Component } from '@angular/core';
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
export class App {}
