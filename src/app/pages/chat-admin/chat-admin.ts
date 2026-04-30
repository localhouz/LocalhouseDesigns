import { Component, signal, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe, DatePipe } from '@angular/common';
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
  imports: [FormsModule, SlicePipe, DatePipe],
  templateUrl: './chat-admin.html',
  styleUrl: './chat-admin.scss',
})
export class ChatAdminComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLElement>;

  status       = signal<'offline' | 'connecting' | 'online'>('offline');
  errorMsg     = signal('');
  threads      = signal<Thread[]>([]);
  activeThread = signal<Thread | null>(null);
  mobileView   = signal<'list' | 'thread'>('list');
  needsSeed    = signal(false);
  seedInput    = '';
  replyText    = '';
  private shouldScroll = false;
  private readonly STORAGE_KEY = 'lh_chat_threads';

  private get ADMIN_SEED(): string {
    return environment.adminSeedHex || localStorage.getItem('lh_admin_seed') || '';
  }
  private client: GenomeRelayClient | null = null;

  constructor() {
    this.threads.set(this.loadThreads());
    document.body.classList.add('chat-admin-active');
    if (!this.ADMIN_SEED) {
      this.needsSeed.set(true);
    } else {
      this.connect();
    }
  }

  saveSeed(): void {
    const s = this.seedInput.trim();
    if (s.length !== 64) return;
    localStorage.setItem('lh_admin_seed', s);
    this.seedInput = '';
    this.needsSeed.set(false);
    this.connect();
  }

  private loadThreads(): Thread[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Thread[]) : [];
    } catch { return []; }
  }

  private saveThreads(threads: Thread[]): void {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(threads)); } catch { /* storage full */ }
  }

  private async connect(): Promise<void> {
    if (!this.ADMIN_SEED) return;
    this.status.set('connecting');

    this.client = new GenomeRelayClient({
      relayUrl: environment.relayUrl,
      seedHex: this.ADMIN_SEED,
      publicKeyHex: environment.adminPublicKeyHex,
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
        let updated: Thread[];
        if (idx >= 0) {
          updated = [...threads];
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, msg],
            unread: this.activeThread()?.visitorDid === visitorDid ? 0 : updated[idx].unread + 1,
          };
        } else {
          updated = [...threads, { visitorDid, name, messages: [msg], unread: 1 }];
        }
        this.saveThreads(updated);
        return updated;
      });

      this.shouldScroll = true;
    });

    try {
      await this.client.connect();
    } catch (err) {
      this.status.set('offline');
      this.errorMsg.set(err instanceof Error ? err.message : String(err));
      console.error('[chat-admin] connect failed:', err);
    }
  }

  selectThread(thread: Thread): void {
    this.threads.update(ts => {
      const updated = ts.map(t => t.visitorDid === thread.visitorDid ? { ...t, unread: 0 } : t);
      this.saveThreads(updated);
      return updated;
    });
    this.activeThread.set({ ...thread, unread: 0 });
    this.mobileView.set('thread');
    this.shouldScroll = true;
  }

  backToList(): void {
    this.mobileView.set('list');
  }

  async sendReply(): Promise<void> {
    const text    = this.replyText.trim();
    const thread  = this.activeThread();
    if (!text || !thread || !this.client?.isConnected) return;

    this.replyText = '';
    const msg = { from: 'steve' as const, text, ts: Date.now() };
    const updatedMessages = [...thread.messages, msg];

    this.threads.update(ts => {
      const updated = ts.map(t => t.visitorDid === thread.visitorDid
        ? { ...t, messages: updatedMessages } : t);
      this.saveThreads(updated);
      return updated;
    });
    this.activeThread.set({ ...thread, messages: updatedMessages });
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

  ngOnDestroy(): void {
    this.client?.disconnect();
    document.body.classList.remove('chat-admin-active');
  }
}
