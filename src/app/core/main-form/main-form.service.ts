import { Injectable } from '@angular/core';
import { RfcService } from '@shared/services/rfc.service';
import { CurpService } from '@shared/services/curp.service';
import {
  GenerateRfcPfBadRequestResponse,
  GenerateRfcPfServiceUnavailableResponse,
  GenerateRfcPmBadRequestResponse,
  GenerateRfcPmServiceUnavailableResponse,
  Rfc,
  RFCWithData,
} from '@shared/services/rfc.service.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { catchError, map, Observable, of } from 'rxjs';
import {
  CurpDataFormValue,
  MainFormValue,
  RfcDataFormValue,
} from '@core/main-form/main-form.interface';
import { Curp } from '@shared/services/curp.service.interface';
import { format } from 'date-fns/format';
import { LoadingState, TipoSujetoCode } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class MainFormService {
  constructor(
    private rfcService: RfcService,
    private curpService: CurpService
  ) {}

  responseError: string | null = null;
  loading = false;

  validateRfc$(formValue: MainFormValue) {
    return of(null).pipe(
      switchMapWithLoading<Rfc>(() =>
        this.rfcService.validateRfc$({ rfcs: [{ rfc: formValue.clave }] })
      )
    );
  }

  validateCurp$(formValue: MainFormValue) {
    return of(null).pipe(
      switchMapWithLoading<Curp>(() =>
        this.curpService.validateCurp$({ curp: formValue.clave })
      )
    );
  }

  validateClave$(formValue: MainFormValue, queryMethod: 'rfc' | 'curp') {
    if (queryMethod === 'curp') {
      return this.validateCurp$(formValue);
    } else if (queryMethod === 'rfc') {
      return this.validateRfc$(formValue);
    } else {
      return of(null);
    }
  }

  validateCurpData$(formValue: CurpDataFormValue) {
    const requestBody = {
      ...formValue,
      fechaNacimiento: format(formValue.fechaNacimiento, 'yyyy-MM-dd'),
      claveEntidad: formValue.claveEntidad.code,
      sexo: formValue.sexo.code,
    };

    return of(null).pipe(
      switchMapWithLoading(() =>
        this.curpService.validateCurpData$(requestBody)
      )
    );
  }

  generateAndValidatePfRfc$(formValue: RfcDataFormValue) {
    return this.rfcService
      .generateRfcPF$({
        nombres: formValue.data.pfData.nombres,
        apellidoPaterno: formValue.data.pfData.apellidoPaterno,
        apellidoMaterno: formValue.data.pfData.apellidoMaterno,
        fechaNacimiento: format(
          formValue.data.pfData.fechaNacimiento,
          'yyyy-MM-dd'
        ),
      })
      .pipe(
        map((value) => {
          if (value.status === 'SUCCESS') {
            // Rfc generated successfully.
            const response = value.response;
            return of(null).pipe(
              switchMapWithLoading(() =>
                this.rfcService.validateRfc$({ rfcs: [{ rfc: response.rfc }] })
              )
            );
          }
          // assuming bad request or service error
          return value;
        })
      );
  }

  generateAndValidatePmRfc$(formValue: RfcDataFormValue) {
    return this.rfcService
      .generateRfcPM$({
        razonSocial: formValue.data.pmData.razonSocial,
        fechaConstitucion: format(
          formValue.data.pmData.fechaConstitucion,
          'yyyy-MM-dd'
        ),
      })
      .pipe(
        map((value) => {
          if (value.status === 'SUCCESS') {
            // RFC generated successfully.
            const response = value.response;
            return of(null).pipe(
              switchMapWithLoading(() =>
                this.rfcService.validateRfc$({
                  rfcs: [
                    {
                      rfc: response.rfc,
                    },
                  ],
                })
              )
            );
          }
          // assuming bad request or service error
          return value;
        })
      );
  }

  generateAndValidateRfc$(
    formValue: RfcDataFormValue
  ): Observable<
    | Observable<LoadingState<Rfc | RFCWithData>>
    | GenerateRfcPmBadRequestResponse
    | GenerateRfcPmServiceUnavailableResponse
    | GenerateRfcPfBadRequestResponse
    | GenerateRfcPfServiceUnavailableResponse
    | null
  > {
    if (formValue.tipoSujeto === 'PF') {
      return this.generateAndValidatePfRfc$(formValue);
    } else if (formValue.tipoSujeto === 'PM') {
      return this.generateAndValidatePmRfc$(formValue);
    }

    return of(null);
  }
}
