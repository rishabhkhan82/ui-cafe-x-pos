import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryItemUnitsMasterComponent } from './inventory-item-units-master.component';

describe('InventoryItemUnitsMasterComponent', () => {
  let component: InventoryItemUnitsMasterComponent;
  let fixture: ComponentFixture<InventoryItemUnitsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryItemUnitsMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryItemUnitsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
