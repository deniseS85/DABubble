import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChannelChatComponent } from './edit-channel-chat.component';

describe('EditChannelChatComponent', () => {
  let component: EditChannelChatComponent;
  let fixture: ComponentFixture<EditChannelChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditChannelChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditChannelChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
