import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerPlansMobileComponent } from './owner-plans-mobile.component';

describe('OwnerPlansMobileComponent', () => {
  let component: OwnerPlansMobileComponent;
  let fixture: ComponentFixture<OwnerPlansMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerPlansMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerPlansMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
