import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureAccessControlComponent } from './feature-access-control.component';

describe('FeatureAccessControlComponent', () => {
  let component: FeatureAccessControlComponent;
  let fixture: ComponentFixture<FeatureAccessControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAccessControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureAccessControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
