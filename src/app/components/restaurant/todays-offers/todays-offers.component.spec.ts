import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysOffersComponent } from './todays-offers.component';

describe('TodaysOffersComponent', () => {
  let component: TodaysOffersComponent;
  let fixture: ComponentFixture<TodaysOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaysOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaysOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
