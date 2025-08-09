import { TestBed } from '@angular/core/testing';

import { XxxService } from './xxx.service';

describe('XxxService', () => {
  let service: XxxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XxxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
