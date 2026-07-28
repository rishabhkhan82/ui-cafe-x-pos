import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupFeeMasterComponent } from './setup-fee-master.component';

describe('SetupFeeMasterComponent', () => {
  let component: SetupFeeMasterComponent;
  let fixture: ComponentFixture<SetupFeeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupFeeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupFeeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
