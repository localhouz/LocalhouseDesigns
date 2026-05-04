import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-website-redesign-service-business',
  imports: [RouterLink],
  templateUrl: './website-redesign-service-business.html',
  styleUrl: '../broken-arrow-web-design/broken-arrow-web-design.scss'
})
export class WebsiteRedesignServiceBusinessComponent implements OnInit {
  private seo = inject(SeoService);

  trustSignals = [
    'Most service business websites don\'t fail because of design — they fail because the messaging is wrong, the service pages are too thin, and the contact path is unclear. A redesign fixes the structure first.',
    'A rebuild isn\'t a coat of paint. It\'s a new architecture built around what the business does, who it serves, what questions buyers actually ask, and what needs to happen for someone to reach out.',
    'Broken Arrow-based studio with real experience rebuilding underperforming service-business sites across Oklahoma — with stronger local SEO, better proof, and contact paths that convert.'
  ];

  pageSections = [
    {
      title: 'Messaging that converts',
      text: 'The homepage answers what you do, who it\'s for, and what to do next before a visitor compares you to a competitor. Vague headlines and buried CTAs get replaced with something that earns the next click.'
    },
    {
      title: 'Service pages with real depth',
      text: 'Instead of one thin services page, individual pages for each service carry the questions buyers ask before they call — with the structure search engines and AI systems can actually read and cite.'
    },
    {
      title: 'Proof and trust structure',
      text: 'Project work, before/after notes, FAQs, location language, and structured data give search engines and real buyers the signals they need to decide you\'re credible before they reach out.'
    },
    {
      title: 'Contact path cleanup',
      text: 'Clear CTAs, working forms, confirmation flows, and tracking wired from day one so you can see where inquiries come from and where people drop off before reaching you.'
    },
    {
      title: 'Technical foundations',
      text: 'Metadata, schema, sitemap, Core Web Vitals, mobile performance, Search Console, and GA4 are part of the build — not an afterthought you have to chase down after launch.'
    }
  ];

  verticals = [
    'Service businesses with sites built on page builders they\'ve outgrown',
    'Businesses whose website hasn\'t been updated in 3+ years',
    'Companies generating traffic but not enough real inquiries',
    'Businesses that moved off a booking platform and never built a proper site',
    'Oklahoma service businesses preparing for growth or market expansion',
    'Any business where the current site makes the next step harder than it should be'
  ];

  faqs = [
    {
      question: 'What makes this a redesign vs. a new build?',
      answer: 'The intent is the same — build a site that actually works. The difference is starting with what exists: what the current site gets right, what\'s broken, what\'s missing, and what a visitor needs that they\'re not getting. The rebuild is cleaner because the problems are already visible.'
    },
    {
      question: 'How long does a website redesign take?',
      answer: 'Most service-business rebuilds take 4–8 weeks depending on scope, content readiness, and how many service pages are involved. The audit up front tightens the scope so nothing gets built that doesn\'t need to be.'
    },
    {
      question: 'Can you redesign a site built on WordPress, Squarespace, or a booking platform?',
      answer: 'Yes. The rebuild starts fresh on a stack that gives the site more control — custom Angular builds or Astro depending on the use case. Platform-limited sites are one of the most common reasons a redesign makes sense.'
    },
    {
      question: 'Will a redesign hurt my existing SEO?',
      answer: 'Not if it\'s done correctly. Redirect mapping, preserving indexed URLs where possible, and improving page structure and schema usually strengthens SEO rather than disrupting it. We handle that as part of the build.'
    },
    {
      question: 'What\'s included in a website redesign audit?',
      answer: 'We look at messaging clarity, service-page depth, contact path friction, local SEO signals, structured data, page speed, and whether the site matches what people are actually searching for. You get 3 concrete fixes within 48 hours.'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    const url = `${base}/website-redesign-service-business`;
    this.seo.setPage({
      title: 'Website Redesign for Service Businesses | Localhouse Designs',
      description: 'Website redesign for service businesses with vague messaging, thin service pages, or a contact path that loses people. Broken Arrow studio serving Oklahoma and beyond.',
      url,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Website Redesign for Service Businesses',
          description: 'Website redesign service for Oklahoma service businesses that need clearer messaging, stronger service pages, better local SEO foundations, and a contact path that converts.',
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Website Redesign for Service Businesses', item: url }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Website redesign for service businesses',
          serviceType: 'Website redesign, service-page rebuilds, local SEO foundations, contact path cleanup',
          provider: { '@id': `${base}/#organization` },
          areaServed: [
            { '@type': 'City', name: 'Broken Arrow' },
            { '@type': 'City', name: 'Tulsa' },
            { '@type': 'City', name: 'Oklahoma City' },
            { '@type': 'State', name: 'Oklahoma' },
            { '@type': 'Country', name: 'United States' }
          ],
          description: 'Website redesign for service businesses that need clearer messaging, stronger service pages, better proof structure, and a contact path that turns visits into actual inquiries.'
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
