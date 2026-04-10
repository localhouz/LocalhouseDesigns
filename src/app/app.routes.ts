import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',         loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'about',    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent) },
  { path: 'insights', loadComponent: () => import('./pages/insights/insights').then(m => m.InsightsComponent) },
  { path: 'insights/what-geo-means-for-local-businesses', loadComponent: () => import('./pages/geo-article/geo-article').then(m => m.GeoArticleComponent) },
  { path: 'insights/what-manufacturers-actually-need-from-erp-connected-tooling', loadComponent: () => import('./pages/erp-article/erp-article').then(m => m.ErpArticleComponent) },
  { path: 'insights/how-structured-data-helps-ai-search-understand-your-business', loadComponent: () => import('./pages/schema-article/schema-article').then(m => m.SchemaArticleComponent) },
  { path: 'insights/why-a-custom-site-beats-a-booking-platform-page-for-local-search', loadComponent: () => import('./pages/platform-article/platform-article').then(m => m.PlatformArticleComponent) },
  { path: 'insights/why-most-dashboards-do-not-fix-the-workflow', loadComponent: () => import('./pages/dashboard-article/dashboard-article').then(m => m.DashboardArticleComponent) },
  { path: 'insights/what-local-service-pages-need-to-rank-and-get-cited', loadComponent: () => import('./pages/service-pages-article/service-pages-article').then(m => m.ServicePagesArticleComponent) },
  { path: 'work',     loadComponent: () => import('./pages/work/work').then(m => m.WorkComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.ServicesComponent) },
  { path: 'contact',  loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent) },
  { path: 'local-geo-audit', loadComponent: () => import('./pages/local-geo-audit/local-geo-audit').then(m => m.LocalGeoAuditComponent) },
  { path: 'lab',      loadComponent: () => import('./pages/lab/lab').then(m => m.LabComponent) },
  { path: 'lab/erp-lite', loadComponent: () => import('./pages/lab-erp-lite/lab-erp-lite').then(m => m.LabErpLiteComponent) },
  { path: '**',       redirectTo: '' },
];
