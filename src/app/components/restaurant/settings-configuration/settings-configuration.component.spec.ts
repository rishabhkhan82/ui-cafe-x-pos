import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsConfigurationComponent } from './settings-configuration.component';

describe('SettingsConfigurationComponent', () => {
  let component: SettingsConfigurationComponent;
  let fixture: ComponentFixture<SettingsConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
