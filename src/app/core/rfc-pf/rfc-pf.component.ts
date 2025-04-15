import { Component } from '@angular/core';
import { RfcPfService } from './rfc-pf.service';

@Component({
  selector: 'app-rfc-pf',
  imports: [],
  templateUrl: './rfc-pf.component.html',
  styleUrl: './rfc-pf.component.scss',
})
export class RfcPfComponent {
  constructor(private rfcPfService: RfcPfService) {}
  ngOnInit() {
    this.rfcPfService.getRfcPfData$().subscribe((value) => console.log(value));
  }
}
