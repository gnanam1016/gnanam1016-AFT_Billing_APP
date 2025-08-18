import { TestBed } from '@angular/core/testing';

import { BillStorage } from './bill-storage';

describe('BillStorage', () => {
  let service: BillStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
