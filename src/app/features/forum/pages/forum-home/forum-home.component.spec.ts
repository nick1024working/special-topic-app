import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumHomeComponent } from './forum-home.component';

describe('ForumHomeComponent', () => {
  let component: ForumHomeComponent;
  let fixture: ComponentFixture<ForumHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
