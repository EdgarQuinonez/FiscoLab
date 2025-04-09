import { Injectable } from '@angular/core';
import {
  RfcFormValue,
  RfcFormDataValue,
  RfcDataFormValue,
  RfcDataFormValueWithData,
} from './rfc-form.interface';
import {
  RFC,
  ValidateRFCSuccessResponse,
  ValidateRFCBadRequestResponse,
  RFCWithData,
  ValidateRFCWithDataBadRequestResponse,
  ValidateRFCWithDataServiceUnavailableResponse,
  ValidateRfcCpQueryRequest,
  ValidateRFCWithDataRequest,
  ValidateRFCServiceUnavailableResponse,
  ValidateRFCWithDataSuccessResponse,
  GenerateRfcPfBadRequestResponse,
  GenerateRfcPfServiceUnavailableResponse,
  GenerateRfcPmBadRequestResponse,
  GenerateRfcPmServiceUnavailableResponse,
} from '@shared/services/rfc.service.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { catchError, filter, iif, map, Observable, of, tap } from 'rxjs';
import { RfcService } from '@shared/services/rfc.service';
import { StorageService } from '@shared/services/storage.service';
import { Router } from '@angular/router';
import cpCatalog from '@public/cp.catalog.json';
import { LoadingState, TipoSujetoCode } from '@shared/types';
import { format } from 'date-fns/format';

@Injectable({
  providedIn: 'root',
})
export class RfcFormService {
  constructor(
    private rfcService: RfcService,
    private storageService: StorageService,
    private router: Router
  ) {}

  validateRFC$(rfcFormValue: RfcFormValue) {
    // TODO: MOVED TO main.form.service. Handle removal.
    return of(null).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcService.validateRfc$({ rfcs: [{ rfc: rfcFormValue.rfc }] })
      )
    );
  }

  validateRFCWithData$(rfcFormValue: RfcFormDataValue) {
    return of(null).pipe(
      switchMapWithLoading<RFCWithData>(() =>
        this.rfcService.validateRFCWithData$([
          {
            rfc: rfcFormValue.rfc,
            cp: rfcFormValue.data.cp,
            nombre:
              rfcFormValue.tipoSujeto === 'PM'
                ? rfcFormValue.data.pmData.razonSocial
                : `${rfcFormValue.data.pfData.nombre} ${rfcFormValue.data.pfData.apellido}`,
          },
        ])
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
            // RFC generated successfully.
            const response = value.response;
            return of(null).pipe(
              switchMapWithLoading(() =>
                this.rfcService.validateRfc$({ rfcs: [{ rfc: response.rfc }] })
              )
            );
          }
          // assuming bad request or service error
          return value;
        }),
        catchError((err) => {
          return of(
            err as
              | GenerateRfcPfBadRequestResponse
              | GenerateRfcPfServiceUnavailableResponse
          );
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
      }),
      catchError((err) => {
        return of(
          err as
            | GenerateRfcPmBadRequestResponse
            | GenerateRfcPmServiceUnavailableResponse
        );
      })
    );
}

generateAndValidatePfRfcWithData$(formValue: RfcDataFormValueWithData) {
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
          // RFC generated successfully.
          const response = value.response;
          return of(null).pipe(
            switchMapWithLoading(() =>
              this.rfcService.validateRFCWithData$([
                {
                  rfc: response.rfc,
                  nombre: `${formValue.data.pfData.nombres} ${formValue.data.pfData.apellidoPaterno} ${formValue.data.pfData.apellidoMaterno}`,
                  cp: formValue.data.cp,
                },
              ])
            )
          );
        }
        // assuming bad request or service error
        return value;
      }),
      catchError((err) => {
        return of(
          err as
            | GenerateRfcPfBadRequestResponse
            | GenerateRfcPfServiceUnavailableResponse
        );
      })
    );
}

generateAndValidatePmRfcWithData$(formValue: RfcDataFormValueWithData) {
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
              this.rfcService.validateRFCWithData$([
                {
                  rfc: response.rfc,
                  nombre: formValue.data.pmData.razonSocial,
                  cp: formValue.data.cp,
                },
              ])
            )
          );
        }
        // assuming bad request or service error
        return value;
      }),
      catchError((err) => {
        return of(
          err as
            | GenerateRfcPmBadRequestResponse
            | GenerateRfcPmServiceUnavailableResponse
        );
      })
    );
}

  cpQuery$(requestBody: ValidateRfcCpQueryRequest) {
    const rfcs: ValidateRFCWithDataRequest['rfcs'] = [];
    const rfcsLimit = 5000;
    let cpArray: string[]; // holds cps to use in the request body

    if (requestBody.estado && requestBody.municipio) {
      const queryResults = cpCatalog[requestBody.estado][requestBody.municipio];
      cpArray = queryResults;

      if (cpArray.length > rfcsLimit) {
        // TODO: Consider warning user about multiple queries that have to be made in order to complete their request.
        throw new Error(
          'Se ha excedido el número de RFCs que se pueden hacer en una sola consulta.'
        );
      }

      for (let cp of queryResults) {
        const rfcObj = {
          rfc: requestBody.rfc,
          nombre: requestBody.nombre,
          cp: cp,
        };

        rfcs.push(rfcObj);
      }
    } else if (requestBody.estado && !requestBody.municipio) {
      // Iterate through all of the mnpios of the state and retrieve their cps into an cpArray
    } else {
      // Iterate through all states and mnpios to retrieve all of their cps
    }

    return of(null).pipe(
      switchMapWithLoading(() => this.rfcService.validateRFCWithData$(rfcs))
    );
  }

  getFinalResponse$(
    validateRfcResponse: Observable<LoadingState<RFC | RFCWithData>> | null
  ) {
    // Goes through all results of the rfcFormResponse to set the final result SUCCESS - INVALID or VALID, or BAD REQUEST (Validation errors.)
    if (!validateRfcResponse) {
      return of(null);
    }
    return validateRfcResponse.pipe(
      filter((value): value is LoadingState<RFC | RFCWithData> => !!value),
      map((value) => {
        const data = value.data;
        const error = value.error as
          | ValidateRFCBadRequestResponse
          | ValidateRFCWithDataBadRequestResponse
          | ValidateRFCServiceUnavailableResponse
          | ValidateRFCWithDataServiceUnavailableResponse;

        if (data?.status === 'SUCCESS') {
          if (this.isRFCWithDataSuccess(data)) {
            const response = data.response;
            const matched = response.rfcs.find(
              (rfc) =>
                rfc.result ===
                  'RFC válido, y susceptible de recibir facturas' ||
                rfc.result ===
                  'El nombre, denominación o razón social no coincide con el registrado en el RFC' ||
                rfc.result ===
                  'RFC no registrado en el padrón de contribuyentes'
            );

            return {
              ...data,
              response: {
                rfcs: [matched ?? response.rfcs[response.rfcs.length - 1]],
              },
            } as ValidateRFCWithDataSuccessResponse;
          } else {
            // Assuming its RFC, only once result/rfc is expected.
            const response = data.response;

            return {
              ...data,
              response: { rfcs: [response.rfcs[0]] },
            } as ValidateRFCSuccessResponse;
          }
        }

        // BAD REQUEST
        if (error) {
          return error;
        }

        return null;
      })
    );
  }

  isRFCWithDataSuccess(
    data: RFC | RFCWithData
  ): data is ValidateRFCWithDataSuccessResponse {
    return 'request' in data && 'cp' in (data as any).response.rfcs[0];
  }
}
