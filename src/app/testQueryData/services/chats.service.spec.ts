import { TestBed } from '@angular/core/testing';

import { ChatsService } from './chats.service';

describe('ChatService', () => {
  let service: ChatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
