import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoEmptyPageComponent } from './demo-empty-page.component';

describe('DemoEmptyPageComponent', () => {
  let component: DemoEmptyPageComponent;
  let fixture: ComponentFixture<DemoEmptyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoEmptyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoEmptyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
