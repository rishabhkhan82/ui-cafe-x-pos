import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCategoryMasterComponent } from './feature-category-master.component';

describe('FeatureCategoryMasterComponent', () => {
  let component: FeatureCategoryMasterComponent;
  let fixture: ComponentFixture<FeatureCategoryMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCategoryMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureCategoryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
