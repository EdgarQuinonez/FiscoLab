import { TestBed } from '@angular/core/testing';

import { CurpDataService } from './curp-data.service';

describe('CurpDataService', () => {
  let service: CurpDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurpDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
