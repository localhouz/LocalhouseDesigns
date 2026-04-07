import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  schemas?: object[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private readonly baseUrl = 'https://localhousedesigns.netlify.app';
  private readonly defaultImage = `${this.baseUrl}/og.png`;

  setPage(config: SeoConfig): void {
    const image = config.image ?? this.defaultImage;
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: config.url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    let canonical = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.url);

    this.clearDynamicSchemas();
    for (const schema of config.schemas ?? []) {
      this.injectSchema(schema);
    }
  }

  private injectSchema(schema: object): void {
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-schema', 'true');
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  private clearDynamicSchemas(): void {
    this.doc.querySelectorAll('script[data-dynamic-schema="true"]')
      .forEach(el => el.remove());
  }
}
