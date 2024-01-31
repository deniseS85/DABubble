import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
    @Output() emojiSelect = new EventEmitter<any>();

    onEmojiSelect(event: any): void {
        this.emojiSelect.emit(event);
    }
}
