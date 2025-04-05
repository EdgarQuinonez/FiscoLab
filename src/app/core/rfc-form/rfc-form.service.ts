import { Injectable } from '@angular/core';
import { RfcFormValue, RfcFormDataValue } from './rfc-form.interface';
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
} from '@shared/services/rfc.service.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { filter, map, Observable, of, tap } from 'rxjs';
import { RfcService } from '@shared/services/rfc.service';
import { StorageService } from '@shared/services/storage.service';
import { Router } from '@angular/router';
import cpCatalog from '@public/cp.catalog.json';
import { LoadingState, TipoSujetoCode } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class RfcFormService {
  constructor(
    private rfcService: RfcService,
    private storageService: StorageService,
    private router: Router
  ) {}

  rfcFormResponse$: Observable<LoadingState<RFC | RFCWithData>> | null = null;
  finalResponse$: Observable<RFCWithData | RFC | null> | null = null; // should store only the final result of the validation rfc SUCCES - INVALID, SUCCESS - VALID, BAD REQUEST AND SERVICE_ERROR
  dataStatus!: { dataIsRequired: boolean };
  responseError: string | null = null;
  tipoSujeto: TipoSujetoCode | null = null;

  validateRFC$(rfcFormValue: RfcFormValue) {
    return new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcService.validateRFC$({ rfcs: [{ rfc: rfcFormValue.rfc }] })
      )
    );
  }

  validateRFCWithData$(rfcFormValue: RfcFormDataValue) {
    return new Observable((subscriber) => subscriber.next()).pipe(
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
      ),
      tap((value) => {
        if (value.data) {
          if (value.data.status === 'SUCCESS') {
            const response = value.data.response;
            const result = response.rfcs[0].result;
            // SUCCESS AND FOUND
            if (result === 'RFC válido, y susceptible de recibir facturas') {
              this.storageService.setItem(
                'tipoSujeto',
                rfcFormValue.tipoSujeto
              );
              this.storageService.setItem('rfc', response.rfcs[0].rfc);
              this.storageService.setItem('rfcResult', result);
              this.storageService.setItem('cp', response.rfcs[0].cp);
              this.storageService.setItem('nombre', response.rfcs[0].nombre);

              this.router.navigateByUrl('/dashboard');
            }
          }
        }
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

    return new Observable((subscriber) => subscriber.next()).pipe(
      switchMapWithLoading(() => this.rfcService.validateRFCWithData$(rfcs))
    );
  }

  getFinalResponse$() {
    // Goes through all results of the rfcFormResponse to set the final result SUCCESS - INVALID or VALID, or BAD REQUEST (Validation errors.)
    if (!this.rfcFormResponse$) {
      return of(null);
    }
    return this.rfcFormResponse$.pipe(
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
            };
          } else {
            // Assuming its RFC, only once result/rfc is expected.
            const response = data.response;

            return {
              ...data,
              response: { rfcs: [response.rfcs[0]] },
            };
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
