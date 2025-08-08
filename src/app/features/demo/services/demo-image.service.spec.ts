import { TestBed } from '@angular/core/testing';

import { DemoImageService } from './demo-image.service';

describe('DemoImageService', () => {
  let service: DemoImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
