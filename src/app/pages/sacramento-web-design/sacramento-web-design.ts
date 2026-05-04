import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-sacramento-web-design',
  imports: [RouterLink],
  templateUrl: './sacramento-web-design.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class SacramentoWebDesignComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'We\'ve built for Sacramento-area brands — NorCal Sauce Worx and Prescribed Burn Sauces are both live Sacramento-market sites delivered remotely with full schema, clear service structure, and real measurement foundations.',
    'Remote work is how we operate. The process — audit, scope, build, launch — doesn\'t require proximity. It requires clear communication and a studio that knows what it\'s doing.',
    'Sacramento businesses face the same conversion problem as every other market: traffic that doesn\'t turn into inquiries because the site is vague, thin, or makes the next step too hard to find.'
  ];

  pageSections = [
    {
      title: 'Offer and service clarity',
      text: 'The site makes what the business does, who it serves, and what to do next clear before a visitor has to look for it. Vague headlines and buried CTAs get replaced with structure that earns the next click.'
    },
    {
      title: 'Service pages that earn trust',
      text: 'Individual pages for each service or product category — with the questions buyers ask, the process explained, and proof nearby — give search engines and real customers enough to make a decision.'
    },
    {
      title: 'Schema and structured data',
      text: 'Every build includes JSON-LD schema matched to the business type: Organization, Service, FAQPage, BreadcrumbList, and Product where relevant. AI search and Google use this to represent the business accurately.'
    },
    {
      title: 'Contact path and measurement',
      text: 'Forms, CTAs, GA4, Search Console, sitemap, and post-launch cleanup are part of every build. The site is measurable and the contact path is frictionless from day one.'
    }
  ];

  verticals = [
    'Sacramento specialty food and CPG brands',
    'Sacramento service businesses outgrowing a template or booking platform',
    'California ecommerce brands that need stronger product and schema structure',
    'Sacramento startups and small businesses building their first real site',
    'NorCal service businesses that generate traffic but not enough inquiries',
    'Remote-friendly businesses anywhere in California needing a full rebuild'
  ];

  faqs = [
    {
      question: 'Does Localhouse Designs work with Sacramento businesses?',
      answer: 'Yes. We\'ve built for Sacramento-area clients including NorCal Sauce Worx and Prescribed Burn Sauces. We work remotely with businesses across California and nationally — the process works the same way regardless of location.'
    },
    {
      question: 'What kinds of Sacramento businesses are the best fit?',
      answer: 'Service businesses, specialty food and CPG brands, ecommerce businesses, and any Sacramento company whose current site is vague, platform-limited, or not generating enough real inquiries from the traffic it already has.'
    },
    {
      question: 'What does a remote web project look like end to end?',
      answer: 'It starts with an audit of what exists and what\'s broken. From there we scope the build, align on content and structure, build and review, and launch with full schema, tracking, and Search Console setup. Communication happens over chat and async review — no calls required.'
    },
    {
      question: 'Do you build ecommerce sites for Sacramento brands?',
      answer: 'Yes. Our Sacramento work includes ecommerce and product-brand sites. We build around product clarity, schema coverage (Product, Offer, FAQPage), and a purchase or inquiry path that reduces friction.'
    },
    {
      question: 'What tech stack do you use for Sacramento projects?',
      answer: 'Angular 21 for full custom builds, Astro for content-heavy or SEO-first sites. Both are paired with JSON-LD schema, GA4, Search Console integration, and Netlify or equivalent for hosting and forms.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/sacramento-web-design`;
    this.seo.setPage({
      title: 'Sacramento Web Design | Localhouse Designs',
      description: 'Sacramento web design and website rebuilds from a studio with real Sacramento-market work. Custom sites for service businesses, CPG brands, and ecommerce — built to rank and convert.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Sacramento Web Design',
          description: 'Sacramento web design landing page for service businesses, specialty food brands, and ecommerce — custom sites with real schema, local SEO foundations, and contact paths that convert.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Sacramento Web Design', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Sacramento web design and website rebuilds',
          serviceType: 'Web design, website rebuilds, ecommerce, schema, local SEO foundations',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Sacramento' },
            { '@type': 'State', name: 'California' },
            { '@type': 'Country', name: 'United States' }
          ],
          description: 'Custom website design and rebuilds for Sacramento businesses — service businesses, specialty food brands, and ecommerce with real schema coverage, strong service-page structure, and contact paths that convert.'
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
