import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';
import { PFDataFromRFCResponse } from './rfc-fisica.interface';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CurpFoundResponseData } from '@core/curp/curp.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import {
  LoadingState,
  RFC,
  ValidateRFCBadRequestResponse,
  ValidateRFCSuccessResponse,
} from '@shared/types';
import { CastPipe } from '@shared/pipes/cast.pipe';

@Component({
  selector: 'app-rfc-fisica',
  imports: [ButtonModule, CardModule, AsyncPipe, CastPipe],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss',
})
export class RfcFisicaComponent {
  results$!: Observable<LoadingState<RFC>>;
  personalData$: Observable<LoadingState<PFDataFromRFCResponse>> | null = null;
  nombres: string | null = null;

  SuccessInterface!: ValidateRFCSuccessResponse;
  BadRequestInterface!: ValidateRFCBadRequestResponse;

  constructor(
    private rfcFisicaService: RfcFisicaService,
    private storageService: StorageService
  ) {}
  ngOnInit() {
    this.results$ = new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcFisicaService.generateAndValidateRFC$()
      ),
      tap((value) => {
        if (value.data) {
          const response = (value.data as ValidateRFCSuccessResponse).response
            .rfcs[0];
          const personalDataStr = this.storageService.getItem('personalData');

          if (
            typeof personalDataStr === 'string' &&
            personalDataStr.length > 0
          ) {
            const personalData: CurpFoundResponseData =
              JSON.parse(personalDataStr);
            this.nombres = personalData.nombres;
          }

          if (
            response.result === 'RFC válido, y susceptible de recibir facturas'
          ) {
            this.storageService.setItem('rfc', response.rfc);
          }
        }
      })
    );
  }

  getPersonalDataOnClick() {
    this.personalData$ = new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading(() => this.rfcFisicaService.personalDataFromRFC$()),
      tap((value) => {
        if (value.data) {
          const response = value.data.response;

          this.storageService.setItem(
            'rfcPfPersonalData',
            JSON.stringify({
              curp: response.curp,
              email: response.email,
              nombreCompleto: response.nombreCompleto,
            })
          );
        }
      })
    );
  }
}
