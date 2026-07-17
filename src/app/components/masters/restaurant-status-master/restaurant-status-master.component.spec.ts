import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantStatusMasterComponent } from './restaurant-status-master.component';

describe('RestaurantStatusMasterComponent', () => {
  let component: RestaurantStatusMasterComponent;
  let fixture: ComponentFixture<RestaurantStatusMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantStatusMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantStatusMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
