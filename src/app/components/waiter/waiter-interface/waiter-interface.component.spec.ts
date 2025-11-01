import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterInterfaceComponent } from './waiter-interface.component';

describe('WaiterInterfaceComponent', () => {
  let component: WaiterInterfaceComponent;
  let fixture: ComponentFixture<WaiterInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaiterInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
