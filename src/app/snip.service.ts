import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface SnipLink {
  code: string;
  url: string;
  shortUrl: string;
  hits: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SnipService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = apiUrl();

  listLinks() {
    return this.http.get<SnipLink[]>(`${this.apiUrl}/api/links`);
  }

  createLink(url: string) {
    return this.http.post<SnipLink>(`${this.apiUrl}/api/links`, { url });
  }
}

function apiUrl() {
  const location = globalThis.location;

  if (!location) {
    return 'http://localhost:3000';
  }

  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (isLocal && location.port && location.port !== '3000') {
    return 'http://localhost:3000';
  }

  return '';
}
