import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-service-business-website-structure-article',
  imports: [RouterLink],
  templateUrl: './service-business-website-structure-article.html',
  styleUrl: '../local-service-rebuild-article/local-service-rebuild-article.scss'
})
export class ServiceBusinessWebsiteStructureArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Homepage: answer what you do, who it\'s for, and what to do next before the fold.',
    'One page per service — not a single generic services list.',
    'Proof pages turn interest into confidence; specificity beats volume.',
    'FAQ content reduces buyer hesitation and supports AI search citations simultaneously.',
    'The contact page should reduce friction, not add it — simple form, clear next step.',
    'Specificity is the common thread: specific services, specific proof, specific answers.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/best-website-structure-for-service-businesses`;
    this.seo.setPage({
      title: 'Best Website Structure for Service Businesses | Localhouse Designs',
      description: 'The website structure that actually works for service businesses: homepage clarity, individual service pages, proof, FAQ content, and a contact path that reduces friction.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['Article'],
          '@id': `${url}#article`,
          headline: 'The Best Website Structure for Service Businesses',
          description: 'The website structure that actually works for service businesses: homepage clarity, individual service pages, proof, FAQ content, and a contact path that reduces friction.',
          datePublished: '2026-05-03',
          dateModified: '2026-05-03',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` },
          about: [
            { '@type': 'Thing', name: 'Website structure' },
            { '@type': 'Thing', name: 'Service business websites' },
            { '@type': 'Thing', name: 'Web design' },
            { '@type': 'Thing', name: 'Conversion optimization' }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Best Website Structure for Service Businesses',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Best Website Structure for Service Businesses', item: url }
            ]
          }
        }
      ]
    });
  }
}
