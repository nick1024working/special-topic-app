import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundDoneComponent } from './fund-done.component';

describe('FundDoneComponent', () => {
  let component: FundDoneComponent;
  let fixture: ComponentFixture<FundDoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundDoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
