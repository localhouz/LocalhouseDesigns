import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-contractor-website-design',
  imports: [RouterLink],
  templateUrl: './contractor-website-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class ContractorWebsiteDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Most contractor websites show a portfolio of photos with no context — no project scope, no outcome, no location. That\'s not proof. It\'s decoration. Buyers need to see work that matches their situation.',
    'Vague service descriptions ("we do it all") don\'t filter intent. They attract tire-kickers and waste estimate time. A well-structured site pre-qualifies leads before they reach your phone.',
    'Licensing, insurance, service area, and what you actually specialize in — these belong in the first screen, not buried in an about page. Credibility signals need to appear where decisions are made.'
  ];

  pageSections = [
    {
      title: 'Project proof that persuades',
      text: 'Specific project pages — scope, location, material, outcome — that give buyers something to compare themselves to. Photo galleries without context don\'t earn trust. Described work does.'
    },
    {
      title: 'Service pages that filter intent',
      text: 'Individual pages for each service category, written for the buyer who\'s already decided they need that specific work. Depth that attracts the right jobs and weeds out the wrong ones.'
    },
    {
      title: 'Credibility in the first screen',
      text: 'License and insurance signals, service area named clearly, years in business, and any specializations visible before a visitor has to look for them. Trust that earns the estimate request.'
    },
    {
      title: 'Quote path that converts',
      text: 'A simple form that asks what the buyer needs to describe their project — not ten fields before they\'ve decided to commit. Clear next-step messaging so they know what happens after they submit.'
    }
  ];

  verticals = [
    'General contractors and remodelers',
    'Roofing companies and storm restoration specialists',
    'Fence, deck, and outdoor structure builders',
    'Painting and finishing contractors',
    'Landscaping and hardscaping businesses',
    'Any contractor whose site attracts too many wrong inquiries or too few right ones'
  ];

  faqs = [
    {
      question: 'What does a contractor website need to generate better leads?',
      answer: 'Specific service pages, project proof with context (not just photos), clear service area, licensing and insurance visibility, and a quote form that asks the right questions upfront. That combination filters intent and earns estimates from the buyers most likely to hire you.'
    },
    {
      question: 'How do I get more quote requests from my website?',
      answer: 'Usually it\'s a contact path problem, not a traffic problem. If the CTA is unclear, the form asks too much too early, or there\'s no next-step messaging after submission — that\'s where the leads disappear. We audit and fix that as part of every build.'
    },
    {
      question: 'Should a contractor have a separate page for each service?',
      answer: 'Yes. A single "Services" page is too thin to rank for specific searches or earn trust for specific work. Individual pages for roofing, fencing, decking, or remodeling each give you a targeted entry point from search and a deeper explanation for the buyer who\'s already interested.'
    },
    {
      question: 'Can you build a contractor site that works for local SEO?',
      answer: 'Yes. Local SEO is built into every project: service area signals, LocalBusiness and Service schema, page-specific metadata, FAQ content, Search Console setup, and a sitemap submitted at launch.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/contractor-website-design`;
    this.seo.setPage({
      title: 'Contractor Website Design | Localhouse Designs',
      description: 'Contractor website design that brings in the right jobs — project proof, service-page depth, credibility signals, local SEO foundations, and a quote path that filters intent.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Contractor Website Design',
          description: 'Contractor website design for general contractors, roofers, remodelers, and specialty trades — project proof, service-page depth, local SEO, and a quote path that filters intent.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Contractor Website Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Contractor website design',
          serviceType: 'Contractor website design, local SEO, service-page structure, project proof, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: { '@type': 'Country', name: 'United States' },
          description: 'Custom website design for contractors — service-page depth, project proof, credibility signals, local SEO foundations, and a quote path that earns better leads.'
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
