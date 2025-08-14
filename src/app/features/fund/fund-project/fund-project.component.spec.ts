import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundProjectComponent } from './fund-project.component';

describe('FundProjectComponent', () => {
    let component: FundProjectComponent;
    let fixture: ComponentFixture<FundProjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FundProjectComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FundProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
