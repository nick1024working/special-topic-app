import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundPlanComponent } from './fund-plan.component';

describe('FundPlanComponent', () => {
  let component: FundPlanComponent;
  let fixture: ComponentFixture<FundPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
