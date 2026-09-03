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
  private readonly apiUrl = 'http://localhost:3000';

  listLinks() {
    return this.http.get<SnipLink[]>(`${this.apiUrl}/api/links`);
  }

  createLink(url: string) {
    return this.http.post<SnipLink>(`${this.apiUrl}/api/links`, { url });
  }
}
