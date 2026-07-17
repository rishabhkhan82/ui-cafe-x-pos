import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTypeMasterComponent } from './order-type-master.component';

describe('OrderTypeMasterComponent', () => {
  let component: OrderTypeMasterComponent;
  let fixture: ComponentFixture<OrderTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
