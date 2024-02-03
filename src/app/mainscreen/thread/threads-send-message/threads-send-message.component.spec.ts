import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadsSendMessageComponent } from './threads-send-message.component';

describe('ThreadsSendMessageComponent', () => {
  let component: ThreadsSendMessageComponent;
  let fixture: ComponentFixture<ThreadsSendMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThreadsSendMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadsSendMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
