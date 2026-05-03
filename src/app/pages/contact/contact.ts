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
    'Website: landing page or simple business site',
    'Website: local service site or advanced frontend',
    'Website: CMS, backend, or database-backed build',
    'Ongoing website support',
    'ERP integration or internal tooling',
    'Software consulting or custom build',
    'Not sure yet'
  ];

  budgetGroups = [
    {
      label: 'Website budgets',
      options: [
        'Up to $3K',
        'Up to $6K',
        'Up to $20K',
        '$250-$2.5K/mo ongoing support'
      ]
    },
    {
      label: 'ERP / software budgets',
      options: [
        'Under $5K',
        '$5K - $15K',
        '$15K - $40K',
        '$40K+'
      ]
    },
    {
      label: 'Still scoping',
      options: [
        "Not sure yet - let's scope it"
      ]
    }
  ];

  timelineOptions = [
    'ASAP / active problem',
    'This month',
    'Next 1-3 months',
    'Just exploring'
  ];

  proofProfiles = [
    {
      label: 'Google',
      url: 'https://www.google.com/search?q=LocalHouse+Designs&stick=H4sIAAAAAAAA_-NgU1I1qDAzMTK1MEg0tzQwMbEwTzK3MqgwNzQ0MzJINDa0AAonmyYuYhXyyU9OzPHILy1OVXBJLc5MzysGAPkbp0A-AAAA&hl=en&mat=CQZBbLnK3T6wElYBTVDHns8FK5RS1Gd0zdWflw-uTzzqluvVx0HPMFEwzG1BjcWoUZb5DF5R53IyXj9QlkXcio_H7iNg7JSslp16ETUkeXhKBsrDQCLlVQEMsK86qMdU7w&authuser=0',
      text: 'Business Profile'
    },
    {
      label: 'Clutch',
      url: 'https://clutch.co/profile/localhouse-designs',
      text: 'Service profile'
    },
    {
      label: 'Yelp',
      url: 'https://www.yelp.com/biz/local-house-designs-broken-arrow',
      text: 'Local listing'
    }
  ];

  ngOnInit() {
    const base = 'https://localhousedesigns.com';
    this.seo.setPage({
      title: 'Contact | Localhouse Designs - Start a Project',
      description: 'Start with the Localhouse Designs chat window when available, or use the form/email backup for a 48-hour audit response from Broken Arrow, Oklahoma.',
      url: `${base}/contact`,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': `${base}/contact#webpage`,
          url: `${base}/contact`,
          name: 'Contact | Localhouse Designs',
          description: 'Start a web or enterprise project with Localhouse Designs. Chat is the preferred first contact path when available, with form and email backup for async details. Based in Broken Arrow, Oklahoma and serving local and remote clients.',
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
              acceptedAnswer: { '@type': 'Answer', text: 'The best way to start is the chat window when it is online. Share your site, what feels off, and the result you want. If chat is offline, use the contact form or email steven@localhousedesigns.com as a backup. Expect a practical audit-style response.' }
            },
            {
              '@type': 'Question',
              name: 'What information should I include in my project inquiry?',
              acceptedAnswer: { '@type': 'Answer', text: 'The most useful details are your current site or page, the main conversion or workflow issue, what kind of result you want, and any rough timing or budget context you already know.' }
            },
            {
              '@type': 'Question',
              name: 'What is the best way to contact Localhouse Designs?',
              acceptedAnswer: { '@type': 'Answer', text: 'Chat is the preferred first contact path when it is online because it keeps the first exchange quick and lightweight. The contact form and steven@localhousedesigns.com are backup async paths.' }
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
