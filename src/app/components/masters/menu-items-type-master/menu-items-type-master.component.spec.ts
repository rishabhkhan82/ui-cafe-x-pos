import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemsTypeMasterComponent } from './menu-items-type-master.component';

describe('MenuItemsTypeMasterComponent', () => {
  let component: MenuItemsTypeMasterComponent;
  let fixture: ComponentFixture<MenuItemsTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemsTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuItemsTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
