import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUsedBookPageComponent } from './update-used-book-page.component';

describe('UpdateUsedBookPageComponent', () => {
  let component: UpdateUsedBookPageComponent;
  let fixture: ComponentFixture<UpdateUsedBookPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUsedBookPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUsedBookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
