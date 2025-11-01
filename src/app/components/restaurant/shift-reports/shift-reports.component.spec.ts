import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftReportsComponent } from './shift-reports.component';

describe('ShiftReportsComponent', () => {
  let component: ShiftReportsComponent;
  let fixture: ComponentFixture<ShiftReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
