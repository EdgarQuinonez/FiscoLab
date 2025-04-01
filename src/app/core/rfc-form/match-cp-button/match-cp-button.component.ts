import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-match-cp-button',
  imports: [ButtonModule],
  templateUrl: './match-cp-button.component.html',
  styleUrl: './match-cp-button.component.scss',
})
export class MatchCpButtonComponent {

  // output to send event on clicked to set queryCpFormShown to true
  handleClick() {
    // move show dialog logic here
    console.log('autocompletar clicked.')
  }
  
}
