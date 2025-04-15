import { TestBed } from '@angular/core/testing';

import { RfcPfService } from './rfc-pf.service';

describe('RfcPfService', () => {
  let service: RfcPfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfcPfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
