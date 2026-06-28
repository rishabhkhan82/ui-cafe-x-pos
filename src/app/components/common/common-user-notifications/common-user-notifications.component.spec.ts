import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonUserNotificationsComponent } from './common-user-notifications.component';

describe('CommonUserNotificationsComponent', () => {
  let component: CommonUserNotificationsComponent;
  let fixture: ComponentFixture<CommonUserNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonUserNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonUserNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
