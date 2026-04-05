import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit {
  private seo = inject(SeoService);

  services = [
    {
      num: '01',
      title: 'Angular Development',
      desc: 'Standalone components, signals, lazy loading, view transitions. We build Angular apps the way Angular intended — clean, fast, and maintainable. Not just functional, but architected for scale.',
      items: ['Standalone components', 'Signals & computed state', 'Lazy-loaded routes', 'View transitions API', 'Responsive design', 'Accessibility (WCAG)']
    },
    {
      num: '02',
      title: 'SEO & GEO',
      desc: 'Traditional search ranking and AI-powered search optimization. FAQPage, HowTo, Product, LocalBusiness, and Service schemas. We make sure both Google and ChatGPT know who you are.',
      items: ['JSON-LD structured data', 'FAQPage & HowTo schemas', 'Product & LocalBusiness markup', 'Per-page meta & OG tags', 'Sitemap & robots.txt', 'Google Search Console setup']
    },
    {
      num: '03',
      title: 'Performance & Deploy',
      desc: 'Netlify deployments, CI/CD pipelines, build optimization. We care about Lighthouse scores and Core Web Vitals because your users do — even if they don\'t know it.',
      items: ['Netlify deployments', 'Build optimization', 'Image compression pipeline', 'Core Web Vitals audit', 'Custom domain & DNS', 'SSL provisioning']
    },
    {
      num: '04',
      title: 'Analytics & Tracking',
      desc: 'GA4, Google Search Console, rich results validation. You can\'t improve what you don\'t measure. We wire in full tracking from day one so you always know what\'s working.',
      items: ['GA4 setup & configuration', 'Search Console verification', 'Rich results validation', 'Event tracking', 'Conversion goals', 'Real-time reporting']
    },
    {
      num: '05',
      title: 'Design Systems',
      desc: 'Token-based design, typography scales, color systems. Consistent, bold, on-brand visual systems that hold up across every page and every device.',
      items: ['CSS custom properties', 'Typography system', 'Component library', 'Dark/light modes', 'Motion & animation', 'Responsive breakpoints']
    },
    {
      num: '06',
      title: 'API & Integrations',
      desc: 'Third-party API wiring, GitHub API, form backends, webhooks. We connect your site to the services that power your business — cleanly and securely.',
      items: ['REST API integration', 'Netlify Forms', 'GitHub API', 'Webhook setup', 'OAuth flows', 'Elfsight & embeds']
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Services | Localhouse Designs — Angular, SEO/GEO, Performance, Design',
      description: 'Full-stack web services from Localhouse Designs: Angular development, SEO/GEO structured data, Netlify deployment, GA4 analytics, and design systems.',
      url: `${base}/services`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@id': `${base}/#organization` },
          serviceType: 'Web Development',
          name: 'Localhouse Designs Web Services',
          url: `${base}/services`,
          description: 'Angular development, SEO/GEO, Netlify deployment, analytics, and design systems.',
          areaServed: { '@type': 'Country', name: 'United States' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Web Development Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Angular Development' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SEO & GEO Optimization' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Performance & Deploy' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Analytics & Tracking' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Design Systems' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'API & Integrations' } }
            ]
          }
        }
      ]
    });
  }
}
