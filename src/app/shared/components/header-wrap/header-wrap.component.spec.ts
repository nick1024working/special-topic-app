import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderWrapComponent } from './header-wrap.component';

describe('HeaderWrapComponent', () => {
  let component: HeaderWrapComponent;
  let fixture: ComponentFixture<HeaderWrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWrapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
