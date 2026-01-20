import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureManagementComponent } from './feature-management.component';

describe('FeatureManagementComponent', () => {
  let component: FeatureManagementComponent;
  let fixture: ComponentFixture<FeatureManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
