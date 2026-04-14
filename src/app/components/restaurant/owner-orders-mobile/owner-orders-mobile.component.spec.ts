import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerOrdersMobileComponent } from './owner-orders-mobile.component';

describe('OwnerOrdersMobileComponent', () => {
  let component: OwnerOrdersMobileComponent;
  let fixture: ComponentFixture<OwnerOrdersMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerOrdersMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerOrdersMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
