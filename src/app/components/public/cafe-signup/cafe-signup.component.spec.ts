import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeSignupComponent } from './cafe-signup.component';

describe('CafeSignupComponent', () => {
  let component: CafeSignupComponent;
  let fixture: ComponentFixture<CafeSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CafeSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
