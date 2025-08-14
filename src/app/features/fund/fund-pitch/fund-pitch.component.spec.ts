import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundPitchComponent } from './fund-pitch.component';

describe('FundPitchComponent', () => {
    let component: FundPitchComponent;
    let fixture: ComponentFixture<FundPitchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FundPitchComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FundPitchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
