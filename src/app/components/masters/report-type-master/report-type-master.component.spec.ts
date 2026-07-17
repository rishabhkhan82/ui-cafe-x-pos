import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTypeMasterComponent } from './report-type-master.component';

describe('ReportTypeMasterComponent', () => {
  let component: ReportTypeMasterComponent;
  let fixture: ComponentFixture<ReportTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
