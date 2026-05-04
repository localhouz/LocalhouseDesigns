import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-okc-web-design',
  imports: [RouterLink],
  templateUrl: './okc-web-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class OkcWebDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Oklahoma City service businesses compete against Wix templates, outdated sites, and national franchise pages that outrank local operators. A custom site with real structure, real service pages, and clear local signals levels the field.',
    'Most OKC service business websites fail at the same points: no individual service pages, phone buried in the footer, and generic messaging that doesn\'t tell a visitor why to call you instead of the next result.',
    'Localhouse Designs is based in Broken Arrow — 20 minutes from OKC. Same market, same contractors, same buyers. We build the kind of sites that earn calls in this region because we understand how it operates.'
  ];

  pageSections = [
    {
      title: 'Service pages that rank locally',
      text: 'Individual pages for each service you offer — not a single "Services" dropdown. Each page targets a specific search, explains the job, names the area, and gives a buyer enough to decide before they call your competitor.'
    },
    {
      title: 'Trust signals in the right place',
      text: 'License, insurance, years in business, and service area visible in the first screen — not buried in an about page. OKC buyers decide fast. The site that earns their confidence first earns the call.'
    },
    {
      title: 'Contact path that doesn\'t lose people',
      text: 'Phone number visible, form simple, next-step messaging clear. Most service business sites lose 30–50% of leads at the contact path — not because of the traffic, but because the path requires too much work.'
    },
    {
      title: 'Local SEO foundations',
      text: 'LocalBusiness schema, consistent NAP, service-area signals, FAQ schema, and Search Console setup at launch. The technical layer that tells Google and AI search systems exactly what your business does and where you serve.'
    }
  ];

  verticals = [
    'HVAC, plumbing, and electrical service companies',
    'Contractors, roofers, and remodelers',
    'Salons, barbershops, and beauty service businesses',
    'Restaurants, bars, and food businesses',
    'Med spas and aesthetics practices',
    'Any OKC service business competing in local search'
  ];

  faqs = [
    {
      question: 'Does Localhouse Designs work with Oklahoma City businesses?',
      answer: 'Yes. We\'re based in Broken Arrow — 20 minutes from OKC — and build custom websites for service businesses across the Oklahoma City metro. Same market awareness, same understanding of local competition, without the distance overhead of a national agency.'
    },
    {
      question: 'What does an OKC service business website need to compete?',
      answer: 'Individual service pages, clear service area, phone number and trust signals in the first screen, local SEO foundations (schema, NAP consistency, Search Console setup), and a contact path that doesn\'t require more than two steps. Most OKC service sites are missing two or three of these.'
    },
    {
      question: 'How do OKC service businesses rank in local search?',
      answer: 'Local Oklahoma City rankings depend on Google Business Profile consistency, on-page LocalBusiness schema, service-area signals, mobile performance, and individual service pages with real depth. We build all of that in from launch, rather than as an afterthought.'
    },
    {
      question: 'Can you rebuild an existing OKC business website?',
      answer: 'Yes. Most OKC website projects start with an existing site that\'s not generating enough calls or inquiries. We audit what\'s broken and rebuild around a structure that earns more of the calls you\'re currently losing to competitors with stronger pages.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/okc-web-design`;
    this.seo.setPage({
      title: 'Oklahoma City Web Design | Localhouse Designs',
      description: 'Web design for Oklahoma City service businesses — custom sites with real service pages, local SEO foundations, and a contact path that earns calls from the OKC market.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Oklahoma City Web Design',
          description: 'Web design for Oklahoma City service businesses — custom sites with individual service pages, local SEO foundations, and a contact path that earns calls.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Oklahoma City Web Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Oklahoma City web design',
          serviceType: 'Web design, local SEO, service-page structure, schema markup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Oklahoma City', containedInPlace: { '@type': 'State', name: 'Oklahoma' } },
            { '@type': 'City', name: 'Edmond', containedInPlace: { '@type': 'State', name: 'Oklahoma' } },
            { '@type': 'City', name: 'Norman', containedInPlace: { '@type': 'State', name: 'Oklahoma' } },
            { '@type': 'City', name: 'Moore', containedInPlace: { '@type': 'State', name: 'Oklahoma' } }
          ],
          description: 'Custom website design for Oklahoma City service businesses — service-page depth, trust signals, local SEO foundations, and a contact path that earns calls in the OKC market.'
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
