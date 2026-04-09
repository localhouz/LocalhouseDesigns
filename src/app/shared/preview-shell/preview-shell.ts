import { Component, Input, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-shell',
  imports: [],
  templateUrl: './preview-shell.html',
  styleUrl: './preview-shell.scss'
})
export class PreviewShellComponent implements OnInit, OnDestroy {
  @Input() previewUrl = '';
  @Input() domain = '';
  @Input() interactive = false;
  @Input() fallbackLabel = '// preview unavailable';

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  loading = true;
  failed = false;
  safeUrl!: SafeResourceUrl;

  private timeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
    if (isPlatformBrowser(this.platformId) && this.previewUrl) {
      this.timeout = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.failed = true;
        }
      }, 8000);
    } else {
      // Server-side: skip loading state so prerendered HTML is clean
      this.loading = false;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }

  onLoad() {
    clearTimeout(this.timeout);
    this.loading = false;
  }
}
