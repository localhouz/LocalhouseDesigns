import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'services', renderMode: RenderMode.Prerender },
  { path: 'work', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'insights', renderMode: RenderMode.Prerender },
  { path: 'insights/what-geo-means-for-local-businesses', renderMode: RenderMode.Prerender },
  { path: 'insights/what-manufacturers-actually-need-from-erp-connected-tooling', renderMode: RenderMode.Prerender },
  // Lab uses Three.js + a Netlify function — client-only, no prerender
  { path: 'lab', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
