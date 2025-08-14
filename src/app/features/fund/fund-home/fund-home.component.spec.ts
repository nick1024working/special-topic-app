import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundHomeComponent } from './fund-home.component';

describe('FundHomeComponent', () => {
    let component: FundHomeComponent;
    let fixture: ComponentFixture<FundHomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FundHomeComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FundHomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
