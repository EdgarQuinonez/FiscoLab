import { TestBed } from '@angular/core/testing';

import { MainDataFormService } from './main-data-form.service';

describe('MainDataFormService', () => {
  let service: MainDataFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainDataFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
