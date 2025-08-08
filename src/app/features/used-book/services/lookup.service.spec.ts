import { TestBed } from '@angular/core/testing';

import { LookupServiceTsService } from './lookup.service';

describe('LookupServiceTsService', () => {
  let service: LookupServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LookupServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
