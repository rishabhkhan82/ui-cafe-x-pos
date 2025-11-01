import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptManagementComponent } from './receipt-management.component';

describe('ReceiptManagementComponent', () => {
  let component: ReceiptManagementComponent;
  let fixture: ComponentFixture<ReceiptManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
