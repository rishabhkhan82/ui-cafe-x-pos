import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoViewAccessComponent } from './no-view-access.component';

describe('NoViewAccessComponent', () => {
  let component: NoViewAccessComponent;
  let fixture: ComponentFixture<NoViewAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoViewAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoViewAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
