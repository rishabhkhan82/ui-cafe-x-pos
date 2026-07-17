import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTypeMasterComponent } from './user-type-master.component';

describe('UserTypeMasterComponent', () => {
  let component: UserTypeMasterComponent;
  let fixture: ComponentFixture<UserTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
