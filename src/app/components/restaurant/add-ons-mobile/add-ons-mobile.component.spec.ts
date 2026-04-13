import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnsMobileComponent } from './add-ons-mobile.component';

describe('AddOnsMobileComponent', () => {
  let component: AddOnsMobileComponent;
  let fixture: ComponentFixture<AddOnsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnsMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
