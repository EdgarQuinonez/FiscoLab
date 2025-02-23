import { Component } from '@angular/core';
import { RfcService } from './rfc.service';

@Component({
  selector: 'app-rfc',
  imports: [],
  templateUrl: './rfc.component.html',
  styleUrl: './rfc.component.scss'
})
export class RfcComponent {
  constructor(private rfcService: RfcService) {}

  ngOnInit() {
    this.rfcService.generateRFC()
  }

}
