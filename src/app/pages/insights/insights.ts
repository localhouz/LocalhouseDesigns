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
            { '@type': 'ListItem', position: 1, url: `${base}/insights/what-geo-means-for-local-businesses`, name: 'What GEO actually means for local businesses' },
            { '@type': 'ListItem', position: 2, url: `${base}/insights/what-manufacturers-actually-need-from-erp-connected-tooling`, name: 'What manufacturers actually need from ERP-connected tooling' },
            { '@type': 'ListItem', position: 3, url: `${base}/insights/how-structured-data-helps-ai-search-understand-your-business`, name: 'How structured data helps AI search understand your business' },
            { '@type': 'ListItem', position: 4, url: `${base}/insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search`, name: 'Why a custom site beats a booking-platform page for local search' }
          ]
        }
      ]
    });
  }
}
