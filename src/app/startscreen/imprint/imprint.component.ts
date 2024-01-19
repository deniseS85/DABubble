import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  @Output() goBack = new EventEmitter<void>();

  constructor() {}
}
