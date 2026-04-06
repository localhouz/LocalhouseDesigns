import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);

  // Core fields
  name = '';
  email = '';
  message = '';
  track = signal<'design' | 'enterprise' | ''>('');
  submitted = signal(false);
  submitting = signal(false);

  // Design track
  designScope = '';
  hasDatabase = '';
  hasCms = '';
  budget = '';

  // Enterprise track
  erpSystem = '';
  enterpriseType = '';
  timeline = '';
  enterpriseBudget = '';

  budgetOptions = [
    'Under $5K',
    '$5K – $15K',
    '$15K – $40K',
    '$40K+',
    "Not sure yet — let's scope it",
  ];

  enterpriseBudgetOptions = [
    'Under $5K',
    '$5K – $15K',
    '$15K – $40K',
    '$40K+',
    "Not sure yet — let's scope it",
  ];

  designScopeOptions = [
    { value: 'fe-only', label: 'Frontend only', hint: 'Angular SPA, brand site, no server-side logic' },
    { value: 'fe-be', label: 'Frontend + backend', hint: 'API, serverless functions, auth, integrations' },
    { value: 'full-stack', label: 'Full stack', hint: 'Frontend + backend + database (SQL/NoSQL)' },
  ];

  erpSystems = ['Microsoft Business Central', 'SAP', 'Infor SyteLine', 'Other / Not sure'];

  enterpriseTypes = [
    { value: 'integration', label: 'Custom integration or report' },
    { value: 'workflow', label: 'Workflow automation' },
    { value: 'dashboard', label: 'Internal dashboard / tooling' },
    { value: 'mobile', label: 'Mobile floor app' },
    { value: 'multi-phase', label: 'Multi-phase ERP project' },
    { value: 'retainer', label: 'Ongoing retainer' },
  ];

  timelineOptions = [
    { value: 'quick', label: 'Quick win', hint: '1–3 weeks' },
    { value: 'mid', label: 'Mid-range', hint: '1–3 months' },
    { value: 'full', label: 'Full project', hint: '3–6 months' },
    { value: 'ongoing', label: 'Ongoing', hint: 'Retainer / continuous' },
  ];

  setTrack(t: 'design' | 'enterprise') {
    this.track.set(t);
    // reset track-specific fields
    this.designScope = '';
    this.hasDatabase = '';
    this.hasCms = '';
    this.budget = '';
    this.erpSystem = '';
    this.enterpriseType = '';
    this.timeline = '';
    this.enterpriseBudget = '';
  }

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Contact | Localhouse Designs — Start a Project',
      description: 'Ready to build something worth finding? Get in touch with Localhouse Designs to start a web or enterprise project.',
      url: `${base}/contact`,
    });
  }

  async onSubmit(form: any) {
    if (!form.valid) return;
    this.submitting.set(true);

    const body = new URLSearchParams({
      'form-name': 'localhouse-contact',
      name: this.name,
      email: this.email,
      track: this.track(),
      // design
      designScope: this.designScope,
      hasDatabase: this.hasDatabase,
      hasCms: this.hasCms,
      budget: this.budget,
      // enterprise
      erpSystem: this.erpSystem,
      enterpriseType: this.enterpriseType,
      timeline: this.timeline,
      enterpriseBudget: this.enterpriseBudget,
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
