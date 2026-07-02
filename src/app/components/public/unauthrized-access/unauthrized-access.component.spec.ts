import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthrizedAccessComponent } from './unauthrized-access.component';

describe('UnauthrizedAccessComponent', () => {
  let component: UnauthrizedAccessComponent;
  let fixture: ComponentFixture<UnauthrizedAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthrizedAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthrizedAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
