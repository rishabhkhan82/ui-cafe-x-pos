import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonRatingsReviewsComponent } from './common-ratings-reviews.component';

describe('CommonRatingsReviewsComponent', () => {
  let component: CommonRatingsReviewsComponent;
  let fixture: ComponentFixture<CommonRatingsReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonRatingsReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonRatingsReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
