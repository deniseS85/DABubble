import { Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  resetSelection() {
    const elements = this.el.nativeElement.querySelectorAll('.selectable');
    elements.forEach((element: HTMLElement) => {
      this.renderer.removeClass(element, 'selected');
    });
  }

  handleClick(event: MouseEvent) {
    this.resetSelection();
    const target = event.target as HTMLElement;
    const selectableElement = this.findClosestSelectable(target);
    if (selectableElement) {
      this.renderer.addClass(selectableElement, 'selected');
    }
  }
  private findClosestSelectable(element: HTMLElement): HTMLElement | null {
    while (element) {
      if (element.classList.contains('selectable')) {
        return element;
      }
      element = element.parentElement!;
    }
    return null;
  }

  hideChannelCreateWindow(event: MouseEvent): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    const channelCreateContainer = document.querySelector('.channel-create-container') as HTMLElement | null;
    if (channelCreateWindow && channelCreateContainer) {
      if (!channelCreateContainer.contains(event.target as Node)) {
        channelCreateWindow.style.display = 'none';
      }
    }
  }

  closeChannelCreateWindow(): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    if (channelCreateWindow) {
      channelCreateWindow.style.display = 'none';
    }
  }

  showChannelCreateWindow(): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    if (channelCreateWindow) {
      channelCreateWindow.style.display = 'block';
    }
  }

  panelOpenState1 = false;
  panelOpenState2 = false;
}
