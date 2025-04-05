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
} from '@shared/services/rfc.service.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Observable, tap } from 'rxjs';
import { RfcService } from '@shared/services/rfc.service';
import { StorageService } from '@shared/services/storage.service';
import { Router } from '@angular/router';
import cpCatalog from '@public/cp.catalog.json';

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
}
