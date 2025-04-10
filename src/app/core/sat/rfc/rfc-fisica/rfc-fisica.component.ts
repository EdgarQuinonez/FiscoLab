import { Component } from '@angular/core';
import { RfcFisicaService } from './rfc-fisica.service';
import { from, Observable, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { StorageService } from '@shared/services/storage.service';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CurpFoundResponseData } from '@core/curp/curp.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@shared/types';
import { CastPipe } from '@shared/pipes/cast.pipe';
import {
  RFC,
  ValidateRFCSuccessResponse,
  ValidateRfcBadRequestResponse,
  ObtainPersonalDataPfRFCSuccessResponse,
} from '@shared/services/rfc.service.interface';
import { RfcService } from '@shared/services/rfc.service';

@Component({
  selector: 'app-rfc-fisica',
  imports: [ButtonModule, CardModule, AsyncPipe, CastPipe],
  templateUrl: './rfc-fisica.component.html',
  styleUrl: './rfc-fisica.component.scss',
})
export class RfcFisicaComponent {
  results$!: Observable<LoadingState<RFC>>;
  personalData$: Observable<
    LoadingState<ObtainPersonalDataPfRFCSuccessResponse>
  > | null = null;
  nombres: string | null = null;

  SuccessInterface!: ValidateRFCSuccessResponse;
  BadRequestInterface!: ValidateRfcBadRequestResponse;

  constructor(
    private rfcService: RfcService,
    private rfcFisicaService: RfcFisicaService,
    private storageService: StorageService
  ) {}
  // ngOnInit() {
  //   this.results$ = of(null).pipe(
  //     switchMapWithLoading<RFC>(() => {
  //       const dataJson = this.storageService.getItem('personalData');
  //       if (!dataJson) {
  //         throw new Error('Missing personalData key in local storage.');
  //       }
  //       const curpData = JSON.parse(dataJson) as CurpFoundResponseData;
  //       const personalData = {
  //         nombres: curpData.nombres,
  //         apellidoPaterno: curpData.primerApellido,
  //         apellidoMaterno: curpData.segundoApellido,
  //         fechaNacimiento: curpData.fechaNacimiento,
  //       };

  //       return this.rfcFisicaService.generateAndValidateRFC$(personalData);
  //     }),
  //     tap((value) => {
  //       if (value.data) {
  //         const response = (value.data as ValidateRFCSuccessResponse).response
  //           .rfcs[0];
  //         const personalDataStr = this.storageService.getItem('personalData');

  //         if (
  //           typeof personalDataStr === 'string' &&
  //           personalDataStr.length > 0
  //         ) {
  //           const personalData: CurpFoundResponseData =
  //             JSON.parse(personalDataStr);
  //           this.nombres = personalData.nombres;
  //         }

  //         if (
  //           response.result === 'RFC válido, y susceptible de recibir facturas'
  //         ) {
  //           this.storageService.setItem('rfc', response.rfc);
  //         }
  //       }
  //     })
  //   );
  // }

  getPersonalDataOnClick() {
    this.personalData$ = of(null).pipe(
      switchMapWithLoading(() => {
        const rfc = this.storageService.getItem('rfc');
        if (typeof rfc != 'string' || rfc === 'undefined') {
          throw new Error('rfc item is not available on localStorage.');
        }
        return this.rfcService.obtainPersonalDataRfcPF$(rfc);
      }),
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
