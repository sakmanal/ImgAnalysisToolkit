import { TestBed } from '@angular/core/testing';

import { SavejsonService } from './savejson.service';

describe('SavejsonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SavejsonService = TestBed.get(SavejsonService);
    expect(service).toBeTruthy();
  });
});
