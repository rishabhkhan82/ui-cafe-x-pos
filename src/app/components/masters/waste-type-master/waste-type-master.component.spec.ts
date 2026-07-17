import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteTypeMasterComponent } from './waste-type-master.component';

describe('WasteTypeMasterComponent', () => {
  let component: WasteTypeMasterComponent;
  let fixture: ComponentFixture<WasteTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasteTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
