import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecieptPageComponent } from './reciept-page.component';

describe('RecieptPageComponent', () => {
  let component: RecieptPageComponent;
  let fixture: ComponentFixture<RecieptPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecieptPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecieptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
