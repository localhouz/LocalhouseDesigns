import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-insights',
  imports: [RouterLink],
  templateUrl: './insights.html',
  styleUrl: './insights.scss'
})
export class InsightsComponent implements OnInit {
  private seo = inject(SeoService);

  articles = [
    {
      title: 'Why branded search ownership matters before local SEO promises',
      desc: 'A practical article on why businesses should own their own branded search results before making bigger SEO promises, and what usually gets in the way.',
      route: '/insights/why-branded-search-ownership-matters-before-local-seo-promises',
      tag: 'Entity / SEO'
    },
    {
      title: 'Why Google can find your page and still not index it',
      desc: 'A plain-English explanation of why Google can discover or crawl a page and still choose not to index it, and what usually matters more than panic.',
      route: '/insights/why-google-can-find-your-page-and-still-not-index-it',
      tag: 'Indexing / SEO'
    },
    {
      title: 'What GEO actually means for local businesses',
      desc: 'A plain-English explanation of GEO, where it fits, and why local businesses should care without getting lost in AI buzzwords.',
      route: '/insights/what-geo-means-for-local-businesses',
      tag: 'SEO / GEO'
    },
    {
      title: 'What manufacturers actually need from ERP-connected tooling',
      desc: 'A practical look at what internal manufacturing software should really do and why fewer bottlenecks matter more than more dashboards.',
      route: '/insights/what-manufacturers-actually-need-from-erp-connected-tooling',
      tag: 'ERP / Operations'
    },
    {
      title: 'ERP Lite: Designing an operational decision surface',
      desc: 'A design and UX case study on turning ERP-heavy operations data into a readable front end for floor teams, planners, and leadership.',
      route: '/insights/erp-lite-designing-an-operational-decision-surface',
      tag: 'ERP / UX'
    },
    {
      title: 'How structured data helps AI search understand your business',
      desc: 'A plain-English look at what schema really does, where it helps, and why it works best when the site is already clear and trustworthy.',
      route: '/insights/how-structured-data-helps-ai-search-understand-your-business',
      tag: 'Structured Data'
    },
    {
      title: 'Why a custom site beats a booking-platform page for local search',
      desc: 'A practical comparison of custom sites versus booking-platform pages when local trust, local SEO, and answer-ready content actually matter.',
      route: '/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search',
      tag: 'Local SEO'
    },
    {
      title: 'Why most dashboards do not fix the workflow',
      desc: 'A practical article on why extra visibility often fails to remove friction and what better internal tooling should do instead.',
      route: '/insights/why-most-dashboards-do-not-fix-the-workflow',
      tag: 'ERP / Workflows'
    },
    {
      title: 'Why local SEO fails when the contact path is vague',
      desc: 'A practical breakdown of NAP clarity, CTA clarity, FAQ schema, and map/directions flow - the levers that decide local conversion.',
      route: '/insights/why-local-seo-fails-when-the-contact-path-is-vague',
      tag: 'Local SEO'
    },
    {
      title: 'What local service pages need to rank and get cited',
      desc: 'A grounded look at what makes a service page useful for local SEO, AI search citations, and actual trust.',
      route: '/insights/what-local-service-pages-need-to-rank-and-get-cited',
      tag: 'Local SEO'
    },
    {
      title: 'How a local service rebuild turns traffic into leads',
      desc: 'A case-study direction for rebuilding a local service site around service clarity, trust, and a cleaner quote path.',
      route: '/insights/how-a-local-service-rebuild-turns-traffic-into-leads',
      tag: 'Case Study'
    },
    {
      title: 'SyteLine Mobile: making ERP access work on the floor',
      desc: 'A mobile operations case study rooted in firsthand ERP experience, and in the need to put faster answers in reach of the people who need them most.',
      route: '/insights/syteline-mobile-making-erp-access-work-on-the-floor',
      tag: 'ERP / Mobile'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Insights | Localhouse Designs - SEO, GEO, ERP, and Workflow Thinking',
      description: 'Practical articles from Localhouse Designs on GEO, SEO, ERP-connected tooling, and what actually makes modern business websites and internal systems useful.',
      url: `${base}/insights`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${base}/insights#webpage`,
          url: `${base}/insights`,
          name: 'Insights | Localhouse Designs',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Localhouse Designs Insights',
          itemListElement: [
            { '@type': 'ListItem', position: 1, url: `${base}/insights/why-branded-search-ownership-matters-before-local-seo-promises`, name: 'Why branded search ownership matters before local SEO promises' },
            { '@type': 'ListItem', position: 2, url: `${base}/insights/why-google-can-find-your-page-and-still-not-index-it`, name: 'Why Google can find your page and still not index it' },
            { '@type': 'ListItem', position: 3, url: `${base}/insights/what-geo-means-for-local-businesses`, name: 'What GEO actually means for local businesses' },
            { '@type': 'ListItem', position: 4, url: `${base}/insights/what-manufacturers-actually-need-from-erp-connected-tooling`, name: 'What manufacturers actually need from ERP-connected tooling' },
            { '@type': 'ListItem', position: 5, url: `${base}/insights/erp-lite-designing-an-operational-decision-surface`, name: 'ERP Lite: Designing an operational decision surface' },
            { '@type': 'ListItem', position: 6, url: `${base}/insights/how-structured-data-helps-ai-search-understand-your-business`, name: 'How structured data helps AI search understand your business' },
            { '@type': 'ListItem', position: 7, url: `${base}/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search`, name: 'Why a custom site beats a booking-platform page for local search' },
            { '@type': 'ListItem', position: 8, url: `${base}/insights/why-most-dashboards-do-not-fix-the-workflow`, name: 'Why most dashboards do not fix the workflow' },
            { '@type': 'ListItem', position: 9, url: `${base}/insights/why-local-seo-fails-when-the-contact-path-is-vague`, name: 'Why local SEO fails when the contact path is vague' },
            { '@type': 'ListItem', position: 10, url: `${base}/insights/what-local-service-pages-need-to-rank-and-get-cited`, name: 'What local service pages need to rank and get cited' },
            { '@type': 'ListItem', position: 11, url: `${base}/insights/how-a-local-service-rebuild-turns-traffic-into-leads`, name: 'How a local service rebuild turns traffic into leads' },
            { '@type': 'ListItem', position: 12, url: `${base}/insights/syteline-mobile-making-erp-access-work-on-the-floor`, name: 'SyteLine Mobile: making ERP access work on the floor' }
          ]
        }
      ]
    });
  }
}
