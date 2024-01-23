import { Component, ElementRef, Renderer2, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})

export class WorkspaceComponent {
  @ViewChild('channelCreateWindow') channelCreateWindow!: ElementRef<HTMLElement>;
  @ViewChild('channelCreateContainer') channelCreateContainer!: ElementRef<HTMLElement>;

  panelOpenState1 = false;
  panelOpenState2 = false;
  showInputNames: boolean = false;
  
  channelCreateForm: FormGroup;
  body = this.elRef.nativeElement.ownerDocument.body;

  constructor(
    private elRef: ElementRef, 
    private renderer: Renderer2, 
    private formBuilder: FormBuilder, 
    private cdr: ChangeDetectorRef
    ) {
    this.channelCreateForm = this.formBuilder.group({
      channelName: ['', [Validators.required]],
      selectedOption: ['specificMembers']
    });
  }

  /**
  * Handles the click event on selectable elements. Removes the class "selected" from all other elements and sets this class to clicked elements
  *
  * @param {MouseEvent} event - The click event.
  * @returns {void}
  */
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const selectableElement = this.findParentElement(target);
    this.elRef.nativeElement.querySelectorAll('.selectable').forEach((element: HTMLElement) => element.classList.remove('selected'));
    this.renderer.addClass(selectableElement, 'selected');
  }
  
  private findParentElement(target: HTMLElement): HTMLElement | null {
    while (target && !target.classList.contains('selectable')) {
      target = target.parentElement!;
    }
    return target;
  }
  
  showChannelCreateWindow(): void {
      this.channelCreateWindow.nativeElement.style.display = 'block';
      this.renderer.setStyle(this.body, 'overflow', 'hidden');
  }

  hideChannelCreateWindow(event: MouseEvent): void {
    if (this.channelCreateWindow && this.channelCreateContainer) {
      if (!this.channelCreateContainer.nativeElement.contains(event.target as Node)) {
        this.closeChannelCreateWindow();
      }
    }
  }

  closeChannelCreateWindow(): void {
      this.channelCreateWindow.nativeElement.style.display = 'none';
      this.renderer.setStyle(this.body, 'overflow', 'auto');
      const inputElements = this.channelCreateWindow.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
      inputElements.forEach((inputElement) => {
        inputElement.value = '';
      });
  }

  channelCreateSecondScreen(): void {
    if (this.channelCreateWindow) {
      const firstScreen = this.channelCreateWindow.nativeElement.querySelectorAll('.first-screen') as NodeListOf<HTMLInputElement>;
      const secondScreen = this.channelCreateWindow.nativeElement.querySelectorAll('.second-screen') as NodeListOf<HTMLInputElement>;
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

  onShowClick() {
    this.showInputNames = true;
    this.cdr.detectChanges();
  }

  onHideClick() {
    this.showInputNames = false;
    this.cdr.detectChanges();
  }

}
