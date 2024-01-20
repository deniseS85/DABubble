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

    // Überprüfe, ob das geklickte Element oder eines seiner Elternelemente die Klasse 'selectable' hat
    const selectableElement = this.findClosestSelectable(target);

    if (selectableElement) {
      this.renderer.addClass(selectableElement, 'selected');
    }
  }

  // Hilfsmethode, um das nächste Elternelement mit der Klasse 'selectable' zu finden
  private findClosestSelectable(element: HTMLElement): HTMLElement | null {
    while (element) {
      if (element.classList.contains('selectable')) {
        return element;
      }
      element = element.parentElement!;
    }
    return null;
  }
  

  panelOpenState1 = false;
  panelOpenState2 = false;
}
