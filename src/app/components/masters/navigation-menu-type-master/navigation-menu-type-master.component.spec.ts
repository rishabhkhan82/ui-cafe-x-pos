import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationMenuTypeMasterComponent } from './navigation-menu-type-master.component';

describe('NavigationMenuTypeMasterComponent', () => {
  let component: NavigationMenuTypeMasterComponent;
  let fixture: ComponentFixture<NavigationMenuTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationMenuTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationMenuTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
