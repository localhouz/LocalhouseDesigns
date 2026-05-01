import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SeoService } from '../../shared/seo/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-live-chat-service',
  imports: [RouterLink, FormsModule],
  templateUrl: './live-chat-service.html',
  styleUrl: './live-chat-service.scss',
})
export class LiveChatServiceComponent implements OnInit {
  private seo  = inject(SeoService);
  private http = inject(HttpClient);

  // ── Signup form ──────────────────────────────────────────────────────────────
  signupState  = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  signupName   = '';
  signupDomain = '';
  signupEmail  = '';
  signupTier   = '';

  async submitSignup(): Promise<void> {
    if (!this.signupName.trim() || !this.signupEmail.trim()) return;
    this.signupState.set('sending');
    try {
      await firstValueFrom(this.http.post(
        `${environment.relayUrl.replace('ws', 'http').replace('wss', 'https')}/api/signup`,
        {
          businessName: this.signupName.trim(),
          domain:       this.signupDomain.trim(),
          email:        this.signupEmail.trim(),
          tier:         this.signupTier,
        }
      ));
      this.signupState.set('sent');
    } catch {
      this.signupState.set('error');
    }
  }

  // ── Page content ─────────────────────────────────────────────────────────────

  steps = [
    {
      num: '01',
      title: 'Visitor opens the chat bubble',
      body: "A small, unobtrusive bubble sits in the corner of your site. When someone has a question, they click it and type — no form, no email, no waiting for a callback.",
    },
    {
      num: '02',
      title: 'You get an instant notification',
      body: "The message routes through a private relay to your inbox and hits your email in seconds. Open the admin panel on your phone or desktop and reply from wherever you are.",
    },
    {
      num: '03',
      title: 'They see your reply in real time',
      body: "The visitor's chat bubble updates live. No page refresh, no redirect. A real conversation — the kind that closes jobs.",
    },
  ];

  reasons = [
    {
      title: 'No SaaS tax',
      body: "Intercom starts at $74/month. Drift can run $400/month. Live chat on your own private relay is a one-time setup fee. You own it.",
    },
    {
      title: 'Private by design',
      body: "Messages never pass through Intercom's servers, Zendesk's servers, or anyone else's. The relay is yours. Conversations stay between you and your customer.",
    },
    {
      title: 'Not a bot',
      body: "There's no AI trying to fake a conversation. Spam gets filtered automatically. Everything that reaches you is a real person with a real question.",
    },
    {
      title: 'Built on proprietary relay tech',
      body: "The chat runs on a private Genome relay mesh — a decentralized messaging layer using ed25519 cryptographic identity. It's the same infrastructure used internally across Localhouse's own products.",
    },
  ];

  features = [
    'Real-time two-way messaging via private relay',
    'Spam filtering with local LLM classification',
    'Instant email notification on new message',
    'Mobile-optimized admin panel (works on any phone)',
    'Persistent message history across sessions',
    'Unread badge and conversation threading',
    "Offline queuing — messages wait if you're not connected",
    'Secure cryptographic identity (ed25519 DID)',
    'No third-party chat vendors in your data path',
    'Branded to your site — not a generic widget',
  ];

  pricing = [
    {
      name: 'Add-on',
      price: '$500–800',
      note: 'one-time, billed at build time',
      highlight: false,
      items: [
        'Clean close — no ongoing conversation needed',
        'Chat included as part of your site build',
        'Widget installed, relay provisioned, admin configured',
        'Email notifications wired to your inbox',
        "Best fit when you're already getting a new site",
      ],
    },
    {
      name: 'Setup + Monthly',
      price: '$300 + $29/mo',
      note: 'setup fee then monthly',
      highlight: true,
      items: [
        'Lower setup cost gets you in the door faster',
        'Monthly covers relay hosting and ongoing support',
        'Works on any existing site — not just Localhouse builds',
        'Cancel anytime — widget stops working if you do',
        'Best fit for standalone chat without a full rebuild',
      ],
    },
    {
      name: 'Bundled',
      price: 'Premium tier',
      note: 'included in select web packages',
      highlight: false,
      items: [
        'No separate sales conversation needed',
        'Chat is part of the deliverable from day one',
        'Higher overall project value, cleaner scope',
        'Best fit for new clients getting a full build',
      ],
    },
  ];

  faqs = [
    {
      q: 'Do I need a developer to use the admin panel?',
      a: "No. The admin panel is a clean mobile-first inbox. You open a link, paste your key once, and you're in. Replying is exactly like texting.",
    },
    {
      q: "What happens when I'm not online?",
      a: 'Messages queue on the relay. The moment you connect, everything you missed is delivered in order. You get an email notification every time a new message arrives, so you never miss one.',
    },
    {
      q: "Can I add this to a site Localhouse didn't build?",
      a: "Yes. The widget is a small script tag added to any website — WordPress, Squarespace, Webflow, custom code. If your site can run a script, it can run the widget.",
    },
    {
      q: 'What does the spam filter do?',
      a: 'Inbound messages run through a local LLM before they reach you. Genuine inquiries come through. Spam, abuse, and nonsense get a polite auto-reply and never reach your inbox.',
    },
    {
      q: 'Is this the same as a contact form?',
      a: "No. A contact form fires an email and the conversation ends. This is live — the visitor sees your reply appear in the bubble while they're still on the page. That difference closes jobs.",
    },
    {
      q: "Who sees my customers' messages?",
      a: 'You. Messages route through a relay that runs on our infrastructure but is provisioned exclusively for your domain. No third-party chat vendors, no analytics companies, no shared queues.',
    },
  ];

  ngOnInit(): void {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Live Chat Add-On | Real-Time Chat on Your Own Private Relay',
      description: 'Add real-time live chat to any website — no Intercom, no Drift, no monthly SaaS fee. Built on a private relay with spam filtering, instant notifications, and a clean mobile admin panel.',
      url: `${base}/services/live-chat`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@id': `${base}/#organization` },
          name: 'Live Chat Add-On',
          url: `${base}/services/live-chat`,
          description: 'Real-time live chat widget and admin panel for any website, running on a private relay with no third-party SaaS vendors.',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: '300',
            description: '$300 setup + $29/month, or $500–800 one-time add-on, or bundled into a premium web package.',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'Do I need a developer to use the admin panel?', acceptedAnswer: { '@type': 'Answer', text: "No. The admin panel is a clean mobile-first inbox. You open a link, paste your key once, and you're in." } },
            { '@type': 'Question', name: "What happens when I'm not online?", acceptedAnswer: { '@type': 'Answer', text: 'Messages queue on the relay and deliver the moment you connect. You also get an email notification every time a new message arrives.' } },
            { '@type': 'Question', name: "Can I add this to a site Localhouse didn't build?", acceptedAnswer: { '@type': 'Answer', text: 'Yes. The widget is a small script tag that works on any website — WordPress, Squarespace, Webflow, or custom code.' } },
          ],
        },
      ],
    });
  }
}
