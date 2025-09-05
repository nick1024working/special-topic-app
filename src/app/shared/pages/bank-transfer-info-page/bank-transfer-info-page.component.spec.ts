import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankTransferInfoPageComponent } from './bank-transfer-info-page.component';

describe('BankTransferInfoPageComponent', () => {
  let component: BankTransferInfoPageComponent;
  let fixture: ComponentFixture<BankTransferInfoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankTransferInfoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankTransferInfoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
