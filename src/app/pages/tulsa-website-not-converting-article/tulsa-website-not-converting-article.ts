import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-tulsa-website-not-converting-article',
  imports: [RouterLink],
  templateUrl: './tulsa-website-not-converting-article.html',
  styleUrl: '../local-service-rebuild-article/local-service-rebuild-article.scss'
})
export class TulsaWebsiteNotConvertingArticleComponent implements OnInit {
  private seo = inject(SeoService);

  takeaways = [
    'Most Tulsa service businesses have a conversion problem, not a traffic problem.',
    'Visitors need three questions answered fast: what is this, is it for me, what do I do next.',
    'Thin service pages don\'t earn enough trust to close the gap between interest and inquiry.',
    'Contact path friction — scattered CTAs, long forms, no confirmation — costs more leads than bad SEO.',
    'A rebuild converts better from existing traffic before you spend more on campaigns.'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/insights/why-your-tulsa-business-website-isnt-converting`;
    this.seo.setPage({
      title: 'Why Your Tulsa Business Website Isn\'t Converting | Localhouse Designs',
      description: 'Why Tulsa service business websites get traffic but not inquiries — and what the rebuild actually fixes: service clarity, trust structure, and a contact path that doesn\'t lose people.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': ['Article'],
          '@id': `${url}#article`,
          headline: 'Why Your Tulsa Business Website Isn\'t Converting',
          description: 'Why Tulsa service business websites get traffic but not inquiries — and what the rebuild actually fixes: service clarity, trust structure, and a contact path that doesn\'t lose people.',
          datePublished: '2026-05-03',
          dateModified: '2026-05-03',
          author: { '@id': `${base}/about#person` },
          publisher: { '@id': `${base}/#organization` },
          mainEntityOfPage: { '@id': `${url}#webpage` },
          about: [
            { '@type': 'Thing', name: 'Website conversion' },
            { '@type': 'Thing', name: 'Tulsa service businesses' },
            { '@type': 'Thing', name: 'Contact path optimization' },
            { '@type': 'Thing', name: 'Local SEO' }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Why Your Tulsa Business Website Isn\'t Converting',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/insights` },
              { '@type': 'ListItem', position: 3, name: 'Why Your Tulsa Business Website Isn\'t Converting', item: url }
            ]
          }
        }
      ]
    });
  }
}
