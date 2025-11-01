import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAlertsComponent } from './system-alerts.component';

describe('SystemAlertsComponent', () => {
  let component: SystemAlertsComponent;
  let fixture: ComponentFixture<SystemAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
