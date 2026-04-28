import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);

  name = '';
  email = '';
  website = '';
  message = '';
  projectType = '';
  submitted = signal(false);
  submitting = signal(false);
  budget = '';
  timeline = '';

  projectTypeOptions = [
    'Local business site or lead-path rebuild',
    'Brand or ecommerce site',
    'ERP integration or internal tooling',
    'Not sure yet'
  ];

  budgetOptions = [
    'Under $5K',
    '$5K - $15K',
    '$15K - $40K',
    '$40K+',
    "Not sure yet - let's scope it"
  ];

  timelineOptions = [
    'ASAP / active problem',
    'This month',
    'Next 1-3 months',
    'Just exploring'
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Contact | Localhouse Designs - Start a Project',
      description: 'Ready to build something worth finding? Send a quick project outline and receive a 48-hour audit response from Localhouse Designs in Broken Arrow, Oklahoma.',
      url: `${base}/contact`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': `${base}/contact#webpage`,
          url: `${base}/contact`,
          name: 'Contact | Localhouse Designs',
          description: 'Start a web or enterprise project with Localhouse Designs. Based in Broken Arrow, Oklahoma and serving local and remote clients through separate Design & Web and Enterprise & ERP tracks with an async, no-call workflow.',
          isPartOf: { '@id': `${base}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: base },
              { '@type': 'ListItem', position: 2, name: 'Contact', item: `${base}/contact` }
            ]
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How do I start a project with Localhouse Designs?',
              acceptedAnswer: { '@type': 'Answer', text: 'Fill out the contact form at localhousedesigns.com/contact. Share your name, email, website or page URL if you have one, what feels off right now, and any timeline or budget context. Expect a reply within 48 hours with a practical audit path.' }
            },
            {
              '@type': 'Question',
              name: 'What information should I include in my project inquiry?',
              acceptedAnswer: { '@type': 'Answer', text: 'The most useful details are your current site or page, the main conversion or workflow issue, what kind of result you want, and any rough timing or budget context you already know.' }
            },
            {
              '@type': 'Question',
              name: 'What is the typical response time for a project inquiry?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs responds to project inquiries within 48 hours. The reply includes an audit-style response, availability, and next steps for scoping.' }
            },
            {
              '@type': 'Question',
              name: 'Where does Localhouse Designs work?',
              acceptedAnswer: { '@type': 'Answer', text: 'Localhouse Designs is based in Broken Arrow, Oklahoma and serves businesses across the Tulsa metro, the wider Oklahoma market, and remote clients nationwide. Client work has also reached as far as Sacramento, California.' }
            }
          ]
        }
      ]
    });
  }

  async onSubmit(form: any) {
    if (!form.valid) return;
    this.submitting.set(true);

    const body = new URLSearchParams({
      'form-name': 'localhouse-contact',
      name: this.name,
      email: this.email,
      website: this.website,
      projectType: this.projectType,
      budget: this.budget,
      timeline: this.timeline,
      message: this.message,
    });

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      this.submitted.set(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
