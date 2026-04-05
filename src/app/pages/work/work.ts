import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../shared/seo/seo.service';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  updated_at: string;
}

@Component({
  selector: 'app-work',
  imports: [CommonModule],
  templateUrl: './work.html',
  styleUrl: './work.scss'
})
export class WorkComponent implements OnInit {
  private seo = inject(SeoService);
  private http = inject(HttpClient);

  repos = signal<Repo[]>([]);
  loading = signal(true);

  caseStudies = [
    {
      title: 'NorCal Sauce Worx',
      subtitle: 'Co-packing brand site',
      url: 'https://norcalsauceworx.netlify.app',
      bg: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 100%)',
      outcome: 'Quote wizard, Netlify Forms, FAQPage + HowTo + Service schemas, sitemap, full GEO coverage.',
      stack: ['Angular 21', 'SCSS', 'Netlify Forms', 'JSON-LD', 'Schema.org'],
      metrics: [
        { val: '8', label: 'FAQ schemas' },
        { val: '5', label: 'Service schemas' },
        { val: '100%', label: 'Form uptime' },
      ]
    },
    {
      title: 'Prescribed Burn Sauces',
      subtitle: 'E-commerce brand site',
      url: 'https://www.prescribedburnsauces.com',
      bg: 'linear-gradient(135deg, #1a0000 0%, #3d0000 100%)',
      outcome: 'WebGL hero, 10 product schemas, GA4, Google Search Console verified, 26 rich result items all valid.',
      stack: ['Angular 21', 'Three.js', 'GA4', 'Schema.org', 'Netlify DNS'],
      metrics: [
        { val: '26', label: 'Rich results' },
        { val: '15', label: 'FAQ entries' },
        { val: '10', label: 'Product schemas' },
      ]
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Work | Localhouse Designs — Angular Builds, SEO/GEO, Live Projects',
      description: 'Case studies and live projects from Localhouse Designs. Angular builds, full SEO/GEO treatment, and GitHub open source work.',
      url: `${base}/work`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          url: `${base}/work`,
          name: 'Work | Localhouse Designs',
          description: 'Portfolio of web development projects by Localhouse Designs.',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Work', item: `${base}/work` }
            ]
          }
        }
      ]
    });

    this.http.get<Repo[]>('https://api.github.com/users/localhouz/repos?sort=updated&per_page=12')
      .subscribe({
        next: (repos) => {
          this.repos.set(repos.filter(r => !r.name.startsWith('.')));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
