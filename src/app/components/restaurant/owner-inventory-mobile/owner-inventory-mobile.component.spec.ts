import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerInventoryMobileComponent } from './owner-inventory-mobile.component';

describe('OwnerInventoryMobileComponent', () => {
  let component: OwnerInventoryMobileComponent;
  let fixture: ComponentFixture<OwnerInventoryMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerInventoryMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerInventoryMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
