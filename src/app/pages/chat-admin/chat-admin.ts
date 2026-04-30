import { Component, signal, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { GenomeRelayClient } from '../../shared/genome/genome-relay-client';
import { environment } from '../../../environments/environment';

interface Thread {
  visitorDid: string;
  name: string;
  messages: { from: 'visitor' | 'steve'; text: string; ts: number }[];
  unread: number;
}

@Component({
  selector: 'app-chat-admin',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './chat-admin.html',
  styleUrl: './chat-admin.scss',
})
export class ChatAdminComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLElement>;

  status      = signal<'offline' | 'connecting' | 'online'>('offline');
  threads     = signal<Thread[]>([]);
  activeThread = signal<Thread | null>(null);
  replyText   = '';
  private shouldScroll = false;

  private readonly ADMIN_SEED = environment.adminSeedHex
    || localStorage.getItem('lh_admin_seed')
    || '';
  private client: GenomeRelayClient | null = null;

  constructor() {
    if (!this.ADMIN_SEED) {
      console.warn('[chat-admin] No admin seed — set lh_admin_seed in localStorage or environment.adminSeedHex');
    }
    this.connect();
  }

  private async connect(): Promise<void> {
    if (!this.ADMIN_SEED) return;
    this.status.set('connecting');

    this.client = new GenomeRelayClient({
      relayUrl: environment.relayUrl,
      seedHex: this.ADMIN_SEED,
    });

    this.client.onConnect((did) => {
      console.log('[chat-admin] Connected as', did);
      this.status.set('online');
    });

    this.client.onDisconnect(() => this.status.set('offline'));

    this.client.onDeliver((env) => {
      const p = env.payload as { type?: string; message?: string; visitorDid?: string; name?: string };
      if (p.type !== 'contact_message' || !p.visitorDid) return;

      const visitorDid = String(p.visitorDid);
      const text       = String(p.message ?? '');
      const name       = String(p.name ?? 'Visitor');

      this.threads.update(threads => {
        const idx = threads.findIndex(t => t.visitorDid === visitorDid);
        const msg = { from: 'visitor' as const, text, ts: env.ts };
        if (idx >= 0) {
          const updated = [...threads];
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, msg],
            unread: this.activeThread()?.visitorDid === visitorDid ? 0 : updated[idx].unread + 1,
          };
          return updated;
        }
        return [...threads, { visitorDid, name, messages: [msg], unread: 1 }];
      });

      this.shouldScroll = true;
    });

    try { await this.client.connect(); } catch { this.status.set('offline'); }
  }

  selectThread(thread: Thread): void {
    this.threads.update(ts => ts.map(t => t.visitorDid === thread.visitorDid ? { ...t, unread: 0 } : t));
    this.activeThread.set(thread);
    this.shouldScroll = true;
  }

  async sendReply(): Promise<void> {
    const text    = this.replyText.trim();
    const thread  = this.activeThread();
    if (!text || !thread || !this.client?.isConnected) return;

    this.replyText = '';
    const msg = { from: 'steve' as const, text, ts: Date.now() };

    this.threads.update(ts => ts.map(t => t.visitorDid === thread.visitorDid
      ? { ...t, messages: [...t.messages, msg] } : t));
    this.activeThread.set({ ...thread, messages: [...thread.messages, msg] });
    this.shouldScroll = true;

    try {
      await this.client.route(thread.visitorDid, { type: 'contact_reply', message: text });
    } catch (err) {
      console.warn('[chat-admin] Reply failed:', err);
    }
  }

  onKeydown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter' && !evt.shiftKey) { evt.preventDefault(); this.sendReply(); }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messagesEl) {
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void { this.client?.disconnect(); }
}
