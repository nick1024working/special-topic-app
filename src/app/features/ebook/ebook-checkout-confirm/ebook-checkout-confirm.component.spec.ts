import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbookCheckoutConfirmComponent } from './ebook-checkout-confirm.component';

describe('EbookCheckoutConfirmComponent', () => {
  let component: EbookCheckoutConfirmComponent;
  let fixture: ComponentFixture<EbookCheckoutConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EbookCheckoutConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbookCheckoutConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
