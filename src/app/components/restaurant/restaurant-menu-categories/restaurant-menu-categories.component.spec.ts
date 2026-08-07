import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantMenuCategoriesComponent } from './restaurant-menu-categories.component';

describe('RestaurantMenuCategoriesComponent', () => {
  let component: RestaurantMenuCategoriesComponent;
  let fixture: ComponentFixture<RestaurantMenuCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantMenuCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantMenuCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
