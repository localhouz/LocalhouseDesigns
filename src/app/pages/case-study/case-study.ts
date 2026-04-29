import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

interface CaseStudy {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  challenge: string;
  work: string[];
  result: string;
  metrics: { value: string; label: string }[];
  stack: string[];
  externalUrl?: string;
}

const CASE_STUDIES: Record<string, CaseStudy> = {
  'north-styles': {
    slug: 'north-styles',
    title: 'North Styles',
    eyebrow: 'Local service brand platform replacement',
    summary: 'A custom standalone brand site built to replace a limited booking-platform presence with stronger local SEO/AEO foundations and a cleaner booking path.',
    challenge: 'The original web presence lived on a limited booking-platform site, which constrained the brand, reduced flexibility, and left little room for richer local search visibility or trust-building content.',
    work: [
      'Rebuilt the web presence from scratch so the business was no longer boxed in by GlossGenius.',
      'Added clearer service context, About and Contact paths, and stronger local trust signals.',
      'Improved local SEO, GEO, and AEO foundations with answer-ready structure and cleaner machine-readable signals.'
    ],
    result: 'North Styles now has a site it owns, with a stronger local front door and a better path from discovery to booking.',
    metrics: [
      { value: 'Custom', label: 'Built from scratch' },
      { value: '3', label: 'SEO / GEO / AEO layers' },
      { value: 'Old -> New', label: 'Platform replaced' }
    ],
    stack: ['Astro', 'Tailwind', 'JSON-LD', 'Local SEO', 'AEO'],
    externalUrl: 'https://north-styles.com/'
  },
  'norcal-sauce-worx': {
    slug: 'norcal-sauce-worx',
    title: 'NorCal Sauce Worx',
    eyebrow: 'Niche B2B service clarity',
    summary: 'An Angular co-packing site that makes a complex hybrid service easier to understand, qualify, and request a quote from.',
    challenge: 'The business needed to explain a specialized co-packing offer clearly enough for potential clients to understand the process, self-qualify, and request a quote without extra back-and-forth.',
    work: [
      'Built an Angular site around quote readiness and clearer service positioning.',
      'Structured content around process questions, co-packing fit, and inquiry flow.',
      'Added structured data and support content so search and answer engines can understand the service context.'
    ],
    result: 'NorCal now has a clearer service identity, a stronger quote path, and a search-ready foundation for a niche B2B offer.',
    metrics: [
      { value: 'Quote', label: 'Wizard flow' },
      { value: 'FAQ + Service', label: 'Schema layers' },
      { value: 'B2B', label: 'Inquiry-ready' }
    ],
    stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD', 'Schema.org'],
    externalUrl: 'https://norcalsauceworx.com'
  },
  'local-geo-standard': {
    slug: 'local-geo-standard',
    title: 'Local GEO Standard',
    eyebrow: 'Repeatable local visibility method',
    summary: 'A results-focused local SEO/GEO proof layer showing a repeatable scoring method across live sites.',
    challenge: 'The audited sites had different weak points: inconsistent NAP visibility, unclear contact flows, and incomplete structured signals that made local discovery and trust less reliable.',
    work: [
      'Scored each site against the same local checklist: NAP, schema, contact clarity, CTA path, map/directions flow, FAQs, and reviews.',
      'Applied the same before-and-after method across North Styles, Prescribed Burn Sauces, and NorCal Sauce Worx.',
      'Published the results layer while keeping implementation details available by request.'
    ],
    result: 'The case study shows the method is repeatable across different sites, not just a one-off redesign story.',
    metrics: [
      { value: '+26', label: 'Average score lift' },
      { value: '3', label: 'Sites audited' },
      { value: 'Repeatable', label: 'Method shown' }
    ],
    stack: ['Local GEO', 'Schema.org', 'On-page SEO', 'AEO']
  }
};

@Component({
  selector: 'app-case-study',
  imports: [RouterLink],
  templateUrl: './case-study.html',
  styleUrl: './case-study.scss'
})
export class CaseStudyComponent implements OnInit {
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  study: CaseStudy = CASE_STUDIES['north-styles'];

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? this.route.snapshot.url.at(-1)?.path ?? 'north-styles';
    this.study = CASE_STUDIES[slug] ?? CASE_STUDIES['north-styles'];
    const base = 'https://localhousedesigns.com';
    const url = `${base}/work/${this.study.slug}`;

    this.seo.setPage({
      title: `${this.study.title} Case Study | Localhouse Designs`,
      description: this.study.summary,
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['Article', 'TechArticle'],
          '@id': `${url}#case-study`,
          url,
          name: `${this.study.title} Case Study`,
          headline: `${this.study.title} Case Study`,
          genre: 'Case study',
          description: this.study.summary,
          publisher: { '@id': `${base}/#organization` },
          about: this.study.stack.map(name => ({ '@type': 'Thing', name }))
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Work', item: `${base}/work` },
            { '@type': 'ListItem', position: 3, name: this.study.title, item: url }
          ]
        }
      ]
    });
  }
}
