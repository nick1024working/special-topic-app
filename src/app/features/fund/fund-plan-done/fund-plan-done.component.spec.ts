import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundPlanDoneComponent } from './fund-plan-done.component';

describe('FundPlanDoneComponent', () => {
  let component: FundPlanDoneComponent;
  let fixture: ComponentFixture<FundPlanDoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundPlanDoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundPlanDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
