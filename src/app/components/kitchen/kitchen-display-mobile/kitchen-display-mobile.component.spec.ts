import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KitchenDisplayMobileComponent } from './kitchen-display-mobile.component';


describe('KitchenDisplayMobileComponent', () => {
  let component: KitchenDisplayMobileComponent;
  let fixture: ComponentFixture<KitchenDisplayMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenDisplayMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenDisplayMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
