import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryItemCategoriesMasterComponent } from './inventory-item-categories-master.component';

describe('InventoryItemCategoriesMasterComponent', () => {
  let component: InventoryItemCategoriesMasterComponent;
  let fixture: ComponentFixture<InventoryItemCategoriesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryItemCategoriesMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryItemCategoriesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
