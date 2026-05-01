import { Component, signal, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GenomeRelayClient } from '../genome/genome-relay-client';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    LHChatConfig?: {
      relayUrl?: string;
      gatekeeperDid?: string;
      tenantId?: string;
      businessName?: string;
      introText?: string;
      offlineText?: string;
    };
  }
}

interface Message {
  from: 'visitor' | 'steve';
  text: string;
  ts: number;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidgetComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLElement>;

  open       = signal(false);
  status     = signal<'offline' | 'connecting' | 'online'>('offline');
  messages   = signal<Message[]>([]);
  inputText    = '';
  visitorName  = '';
  sending      = signal(false);
  submitted    = signal(false);

  private client: GenomeRelayClient | null = null;
  private shouldScroll = false;

  private readonly _cfg    = typeof window !== 'undefined' ? window.LHChatConfig : undefined;
  readonly GATEKEEPER_DID  = this._cfg?.gatekeeperDid ?? environment.gatekeeperDid;
  readonly RELAY_URL       = this._cfg?.relayUrl      ?? environment.relayUrl;
  readonly TENANT_ID       = this._cfg?.tenantId      ?? environment.tenantId;
  readonly BUSINESS_NAME   = this._cfg?.businessName  ?? environment.businessName;
  readonly INTRO_TEXT      = this._cfg?.introText     ?? environment.introText;
  readonly OFFLINE_TEXT    = this._cfg?.offlineText   ?? environment.offlineText;

  async toggleOpen(): Promise<void> {
    this.open.update(v => !v);
    if (this.open() && !this.client) await this.initRelay();
  }

  private async initRelay(): Promise<void> {
    this.status.set('connecting');
    this.client = new GenomeRelayClient({ relayUrl: this.RELAY_URL });

    this.client.onConnect(() => {
      this.status.set('online');
    });

    this.client.onDisconnect(() => {
      this.status.set('offline');
    });

    this.client.onDeliver((env) => {
      const p = env.payload as { type?: string; message?: string; text?: string };
      const text = p.message ?? p.text ?? '';
      const isReply = !p.type || p.type === 'contact_reply' || p.type === 'contact_bounce';
      if (isReply && text) {
        this.messages.update(msgs => [...msgs, {
          from: 'steve',
          text: String(text),
          ts: env.ts,
        }]);
        this.shouldScroll = true;
      }
    });

    try {
      await this.client.connect();
    } catch {
      this.status.set('offline');
    }
  }

  async send(): Promise<void> {
    const text = this.inputText.trim();
    if (!text || !this.client?.isConnected || this.sending()) return;

    this.sending.set(true);
    this.messages.update(msgs => [...msgs, { from: 'visitor', text, ts: Date.now() }]);
    this.inputText = '';
    this.shouldScroll = true;
    this.submitted.set(true);

    try {
      await this.client.route(this.GATEKEEPER_DID, {
        type: 'contact_message',
        message: text,
        name: this.visitorName.trim() || 'Visitor',
        tenantId: this.TENANT_ID,
      });
    } catch {
      // Already shows in bubble — silently ignore route errors
    } finally {
      this.sending.set(false);
    }
  }

  onKeydown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter' && !evt.shiftKey) { evt.preventDefault(); this.send(); }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messagesEl) {
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.client?.disconnect();
  }
}
