import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SnipLink, SnipService } from './snip.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly snip = inject(SnipService);

  readonly url = signal('');
  readonly links = signal<SnipLink[]>([]);
  readonly latestLink = signal<SnipLink | null>(null);
  readonly error = signal('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isInvalidUrl = computed(() => {
    const value = this.url().trim();

    if (!value) {
      return false;
    }

    return !this.isHttpUrl(value);
  });

  ngOnInit() {
    this.loadLinks();
  }

  createLink() {
    const url = this.url().trim();

    this.error.set('');
    this.latestLink.set(null);

    if (!this.isHttpUrl(url)) {
      this.error.set('Enter a URL that starts with http:// or https://.');
      return;
    }

    this.isSaving.set(true);
    this.snip.createLink(url).pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (link) => {
        this.latestLink.set(link);
        this.links.update((links) => [link, ...links]);
        this.url.set('');
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.error || 'Could not shorten that URL. Check the backend and try again.');
      },
    });
  }

  refreshLinks() {
    this.loadLinks();
  }

  private loadLinks() {
    this.isLoading.set(true);
    this.error.set('');
    this.snip.listLinks().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (links) => this.links.set(links),
      error: () => this.error.set('Could not load links. Is the backend running on http://localhost:3000?'),
    });
  }

  private isHttpUrl(value: string) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
