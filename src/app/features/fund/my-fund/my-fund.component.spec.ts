import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFundComponent } from './my-fund.component';

describe('MyFundComponent', () => {
  let component: MyFundComponent;
  let fixture: ComponentFixture<MyFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
