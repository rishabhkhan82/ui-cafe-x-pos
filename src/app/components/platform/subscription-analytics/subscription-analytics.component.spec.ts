import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionAnalyticsComponent } from './subscription-analytics.component';

describe('SubscriptionAnalyticsComponent', () => {
  let component: SubscriptionAnalyticsComponent;
  let fixture: ComponentFixture<SubscriptionAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
