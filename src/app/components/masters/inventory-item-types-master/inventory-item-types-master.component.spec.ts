import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryItemTypesMasterComponent } from './inventory-item-types-master.component';

describe('InventoryItemTypesMasterComponent', () => {
  let component: InventoryItemTypesMasterComponent;
  let fixture: ComponentFixture<InventoryItemTypesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryItemTypesMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryItemTypesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
