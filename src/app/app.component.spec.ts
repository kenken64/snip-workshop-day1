import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SnipService } from './snip.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: SnipService, useValue: { listLinks: () => of([]), createLink: () => of(null) } }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
