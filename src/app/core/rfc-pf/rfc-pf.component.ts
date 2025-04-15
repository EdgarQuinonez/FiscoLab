import { Component } from '@angular/core';
import { RfcPfService } from './rfc-pf.service';
import { Observable, of } from 'rxjs';
import { RfcPfData } from './rfc-pf.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@shared/types';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-rfc-pf',
  imports: [AsyncPipe],
  templateUrl: './rfc-pf.component.html',
  styleUrl: './rfc-pf.component.scss',
})
export class RfcPfComponent {
  constructor(private rfcPfService: RfcPfService) {}

  data!: Observable<LoadingState<RfcPfData>>;

  ngOnInit() {
    this.data = of(null).pipe(
      switchMapWithLoading<RfcPfData>(() => this.rfcPfService.getRfcPfData$())
    );
  }
}
