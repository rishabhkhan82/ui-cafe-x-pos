import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSupportComponent } from './common-support.component';

describe('CommonSupportComponent', () => {
  let component: CommonSupportComponent;
  let fixture: ComponentFixture<CommonSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
