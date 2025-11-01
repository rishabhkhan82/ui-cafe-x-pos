import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanManagementComponent } from './plan-management.component';

describe('PlanManagementComponent', () => {
  let component: PlanManagementComponent;
  let fixture: ComponentFixture<PlanManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
