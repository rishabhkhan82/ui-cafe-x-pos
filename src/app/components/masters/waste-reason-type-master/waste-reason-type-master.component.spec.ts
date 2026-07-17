import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteReasonTypeMasterComponent } from './waste-reason-type-master.component';

describe('WasteReasonTypeMasterComponent', () => {
  let component: WasteReasonTypeMasterComponent;
  let fixture: ComponentFixture<WasteReasonTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteReasonTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasteReasonTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
