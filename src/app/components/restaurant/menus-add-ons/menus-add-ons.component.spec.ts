import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusAddOnsComponent } from './menus-add-ons.component';

describe('MenusAddOnsComponent', () => {
  let component: MenusAddOnsComponent;
  let fixture: ComponentFixture<MenusAddOnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusAddOnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusAddOnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
