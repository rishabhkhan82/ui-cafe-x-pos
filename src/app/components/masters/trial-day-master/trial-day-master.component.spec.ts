import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialDayMasterComponent } from './trial-day-master.component';

describe('TrialDayMasterComponent', () => {
  let component: TrialDayMasterComponent;
  let fixture: ComponentFixture<TrialDayMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrialDayMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrialDayMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
