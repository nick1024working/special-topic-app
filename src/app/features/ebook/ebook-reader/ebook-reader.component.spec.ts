import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbookReaderComponent } from './ebook-reader.component';

describe('EbookReaderComponent', () => {
  let component: EbookReaderComponent;
  let fixture: ComponentFixture<EbookReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EbookReaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbookReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
