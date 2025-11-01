import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformDashboardComponent } from './platform-dashboard.component';

describe('PlatformDashboardComponent', () => {
  let component: PlatformDashboardComponent;
  let fixture: ComponentFixture<PlatformDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatformDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
