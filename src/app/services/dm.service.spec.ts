import { TestBed } from '@angular/core/testing';

import { directMessagesService } from './dm.service';

describe('ChatService', () => {
  let service: directMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(directMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
