import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-med-spa-website-design',
  imports: [RouterLink],
  templateUrl: './med-spa-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class MedSpaWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Med spa clients research more carefully than almost any other service buyer. They\'re making decisions about their face and body. A site that doesn\'t clearly explain treatments, show real results, and establish provider credentials loses them to a competitor who does.',
    'Generic treatment pages that say "Botox and fillers available" with no explanation of the process, the provider, or what to expect don\'t earn consultations — they create hesitation. Depth is trust.',
    'Before/after work, named providers with credentials, and real treatment descriptions do more to convert a research session into a booked consultation than any design choice.'
  ];

  pageSections = [
    {
      title: 'Treatment pages with real depth',
      text: 'Individual pages for each treatment — what it addresses, how it works, what to expect, recovery, pricing range, and who it\'s for. The buyer doing research needs enough to make a decision before they contact you.'
    },
    {
      title: 'Provider credentials and trust signals',
      text: 'Named providers with credentials, certifications, and background visible near where decisions are made — not buried in an about page. In medical aesthetics, the provider is the product.'
    },
    {
      title: 'Before/after and results structure',
      text: 'Real results organized by treatment, with context — not a generic gallery. Structured for fast mobile load and optimized for the searches buyers do when they\'re evaluating whether to book.'
    },
    {
      title: 'Consultation path that reduces friction',
      text: 'A booking or consultation request flow that matches the buyer\'s intent — whether they\'re ready to book or still in research mode. Clear next steps and confirmation messaging that builds confidence after they submit.'
    }
  ];

  verticals = [
    'Medical aesthetics practices offering Botox, filler, and injectables',
    'Laser and skin care studios with multiple treatment offerings',
    'Med spas replacing a platform page with a real brand site',
    'Wellness and aesthetics businesses building a consultation-first experience',
    'IV therapy and hormone wellness practices',
    'Any aesthetics business where the buyer researches extensively before booking'
  ];

  faqs = [
    {
      question: 'What does a med spa website need to generate more consultation bookings?',
      answer: 'Individual treatment pages with real depth, named provider credentials, before/after results organized by treatment, a consultation path that works for buyers still in research mode, and local SEO foundations so the site ranks when someone searches for your specific treatments in your area.'
    },
    {
      question: 'How do I build trust on a med spa website?',
      answer: 'Named providers with credentials, specific treatment descriptions that explain the process and what to expect, real before/after work with context, and FAQ content that addresses the questions buyers have before they\'re ready to book. Generic "professional team" copy doesn\'t earn trust — specific information does.'
    },
    {
      question: 'Should a med spa have separate pages for each treatment?',
      answer: 'Yes. A single "Services" page can\'t rank for specific treatment searches like "Botox near me" or "laser hair removal [city]" and can\'t give buyers the depth they need to feel confident booking. Individual treatment pages each target a specific search and earn trust through specificity.'
    },
    {
      question: 'Can you build a med spa site that works for local SEO?',
      answer: 'Yes. Every build includes LocalBusiness and MedicalBusiness schema, service-area signals, treatment-specific metadata, FAQ content, and Search Console setup at launch. The structure is built to support local rankings for specific treatment searches from day one.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/med-spa-website-design`;
    this.seo.setPage({
      title: 'Med Spa Website Design | Localhouse Designs',
      description: 'Med spa website design that earns consultations — treatment pages with real depth, provider credentials, before/after structure, and local SEO foundations that convert research into booked appointments.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Med Spa Website Design',
          description: 'Med spa website design for medical aesthetics practices — treatment-page depth, provider credentials, before/after structure, consultation path, and local SEO foundations.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Med Spa Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Med spa website design',
          serviceType: 'Med spa website design, medical aesthetics, treatment pages, local SEO, consultation path, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for med spas and medical aesthetics practices — treatment-page depth, provider trust signals, before/after structure, and local SEO foundations that earn consultations.'
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
          }))
        }
      ]
    });
  }
}
