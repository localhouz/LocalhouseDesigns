import { Component, inject, OnInit, signal } from '@angular/core';
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

  name = '';
  email = '';
  project = '';
  budget = '';
  message = '';
  submitted = signal(false);
  submitting = signal(false);

  budgetOptions = ['< $500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Let\'s talk'];

  ngOnInit() {
    const base = 'https://localhousedesigns.netlify.app';
    this.seo.setPage({
      title: 'Contact | Localhouse Designs — Start a Project',
      description: 'Ready to build something worth finding? Get in touch with Localhouse Designs to start a web project.',
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
      project: this.project,
      budget: this.budget,
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
