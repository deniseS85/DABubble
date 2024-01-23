import { Component, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  panelOpenState1 = false;
  panelOpenState2 = false;
  
  inputOpen = false;
  
  channelCreateForm: FormGroup;

  body = this.elRef.nativeElement.ownerDocument.body;
  

  constructor(private elRef: ElementRef, private renderer: Renderer2, private formBuilder: FormBuilder) {
    this.channelCreateForm = this.formBuilder.group({
      channelName: ['', [Validators.required]],
      selectedOption: ['specificMembers']
    });
  }

  resetSelection() {
    const elements = this.elRef.nativeElement.querySelectorAll('.selectable');
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
        const inputElements = channelCreateWindow.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        inputElements.forEach((inputElement) => {
          inputElement.value = '';
        });
      }
    }
  }

  closeChannelCreateWindow(): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    if (channelCreateWindow) {
      channelCreateWindow.style.display = 'none';
      this.renderer.setStyle(this.body, 'overflow', 'auto');
      const inputElements = channelCreateWindow.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
      inputElements.forEach((inputElement) => {
        inputElement.value = '';
      });
    }
  }


  showChannelCreateWindow(): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    if (channelCreateWindow) {
      channelCreateWindow.style.display = 'block';
      this.renderer.setStyle(this.body, 'overflow', 'hidden');
    }
  }

  channelCreateSecondScreen(): void {
    const channelCreateWindow = document.querySelector('.channel-create-window') as HTMLElement | null;
    if (channelCreateWindow) {
      const firstScreen = channelCreateWindow.querySelectorAll('.first-screen') as NodeListOf<HTMLInputElement>;
      const secondScreen = channelCreateWindow.querySelectorAll('.second-screen') as NodeListOf<HTMLInputElement>;
      firstScreen.forEach((firstScreen) => {
        firstScreen.style.display = 'none';
        this.renderer.setStyle(this.body, 'overflow', 'auto');
      });
      secondScreen.forEach((secondScreen) => {
        secondScreen.style.display = 'block';
        this.renderer.setStyle(this.body, 'overflow', 'hidden');
      });
    }
  }

}
