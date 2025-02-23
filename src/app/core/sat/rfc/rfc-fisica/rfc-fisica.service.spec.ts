import { TestBed } from '@angular/core/testing';

import { RfcFisicaService } from './rfc-fisica.service';

describe('RfcFisicaService', () => {
  let service: RfcFisicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfcFisicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
