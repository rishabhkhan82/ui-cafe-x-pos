import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantManagerDashboardComponent } from './restaurant-manager-dashboard.component';

describe('RestaurantManagerDashboardComponent', () => {
  let component: RestaurantManagerDashboardComponent;
  let fixture: ComponentFixture<RestaurantManagerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantManagerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantManagerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
