import { TestBed } from '@angular/core/testing';

import { MainFormService } from './main-form.service';

describe('MainFormService', () => {
  let service: MainFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
