import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerMenusMobileComponent } from './owner-menus-mobile.component';

describe('OwnerMenusMobileComponent', () => {
  let component: OwnerMenusMobileComponent;
  let fixture: ComponentFixture<OwnerMenusMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerMenusMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerMenusMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
