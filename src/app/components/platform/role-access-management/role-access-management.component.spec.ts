import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleAccessManagementComponent } from './role-access-management.component';


describe('RoleAccessManagementComponent', () => {
  let component: RoleAccessManagementComponent;
  let fixture: ComponentFixture<RoleAccessManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAccessManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAccessManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
