import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsReportingComponent } from './analytics-reporting.component';

describe('AnalyticsReportingComponent', () => {
  let component: AnalyticsReportingComponent;
  let fixture: ComponentFixture<AnalyticsReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsReportingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
