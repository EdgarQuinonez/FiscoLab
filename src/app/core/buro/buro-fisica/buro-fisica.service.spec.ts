import { TestBed } from '@angular/core/testing';

import { BuroFisicaService } from './buro-fisica.service';

describe('BuroFisicaService', () => {
  let service: BuroFisicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuroFisicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
