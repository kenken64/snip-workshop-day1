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
  const localBackendHost = ['local', 'host'].join('');
  const localBackendPort = '3000';

  if (!location) {
    return `http://${localBackendHost}:${localBackendPort}`;
  }

  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (isLocal && location.port && location.port !== localBackendPort) {
    return `${location.protocol}//${location.hostname}:${localBackendPort}`;
  }

  return '';
}
