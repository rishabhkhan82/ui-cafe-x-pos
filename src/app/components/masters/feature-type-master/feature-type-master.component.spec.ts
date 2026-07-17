import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureTypeMasterComponent } from './feature-type-master.component';

describe('FeatureTypeMasterComponent', () => {
  let component: FeatureTypeMasterComponent;
  let fixture: ComponentFixture<FeatureTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
