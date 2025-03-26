import { TestBed } from '@angular/core/testing';

import { RfcFormService } from './rfc-form.service';

describe('RfcFormService', () => {
  let service: RfcFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfcFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
