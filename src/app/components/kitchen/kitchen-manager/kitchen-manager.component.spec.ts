import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenManagerComponent } from './kitchen-manager.component';

describe('KitchenManagerComponent', () => {
  let component: KitchenManagerComponent;
  let fixture: ComponentFixture<KitchenManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
