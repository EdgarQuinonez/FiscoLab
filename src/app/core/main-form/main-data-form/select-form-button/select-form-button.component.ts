import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-form-button',
  imports: [FormsModule],
  templateUrl: './select-form-button.component.html',
  styleUrl: './select-form-button.component.scss',
})
export class SelectFormButtonComponent {
  selectedForm = model<'curp' | 'rfc'>('curp');
}
