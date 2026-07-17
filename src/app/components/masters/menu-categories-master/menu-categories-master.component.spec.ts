import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCategoriesMasterComponent } from './menu-categories-master.component';

describe('MenuCategoriesMasterComponent', () => {
  let component: MenuCategoriesMasterComponent;
  let fixture: ComponentFixture<MenuCategoriesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCategoriesMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuCategoriesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
