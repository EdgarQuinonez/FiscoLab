import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable } from 'rxjs'
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-rfc-fisica',
  imports: [AsyncPipe],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss'
})
export class RfcFisicaComponent {    

  constructor(private rfcFisicaService: RfcFisicaService) {}
  ngOnInit() {    
  }
}
