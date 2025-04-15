import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CurpService } from '@shared/services/curp.service';
import { ValidateCurpFoundResponse } from '@shared/services/curp.service.interface';
import { RfcService } from '@shared/services/rfc.service';
import {
  GenerateRfcPfRequest,
  GenerateRfcPfSuccessResponse,
  ObtainPersonalDataPfRfcSuccessFoundResponse,
  ValidateCodigoPostal,
  ValidateCodigoPostalSuccessFoundResponse,
  ValidateRfcCpQueryRequest,
} from '@shared/services/rfc.service.interface';
import { StorageService } from '@shared/services/storage.service';
import {
  StorageKey,
  StorageValueType,
  LOCAL_STORAGE_KEYS,
} from '@shared/types';
import { catchError, Observable, of, switchMap, throwError, tap } from 'rxjs';
import curpCatalog from '@public/curp.catalog.json';

@Injectable({
  providedIn: 'root',
})
export class RfcPfService {
  constructor(
    private storageService: StorageService,
    private rfcService: RfcService,
    private curpService: CurpService,
    private router: Router
  ) {}

  getRfcPfData$() {
    const startingPoint = this.getStartingPoint();

    if (!startingPoint) {
      throw new Error(
        'No se encuentra disponible el punto de partida (RFC o CURP).'
      );
    }

    // if (startingPoint === 'RFC') {
    //   return this.initWithRfc();
    // } else if (startingPoint === 'CURP') {
    //   return this.initWithCurp$();
    // }

    return this.initWithCurp$();
  }

  private readonly STARTING_POINT_KEYS: StorageKey[] = ['CURP', 'RFC'];

  private getStartingPoint(): StorageKey | null {
    return (
      this.STARTING_POINT_KEYS.find(
        (key) => this.storageService.getItemValue(key) !== null
      ) || null
    );
  }

  private initWithCurp$() {
    const rfcPfData: Partial<{
      rfc: string;
      curp: string;
      email: string;
      nombreCompleto: string;
      codigoPostal: string;
      rfcResult: string;
      asentamiento: string;
      ciudad: string;
      claveDeOficina: string;
      delegacionMunicipio: string;
      estado: string;
      tipoDeAsentamiento: string;
    }> = {};

    return this.getValidateCurpFoundResponse$().pipe(
      switchMap(() => this.getRfc$()),
      tap((value) => (rfcPfData.rfc = value)),
      switchMap(() => this.obtainPersonalDataFromRfcPf$()),
      tap((value) => {
        rfcPfData.curp = value.curp;
        rfcPfData.email = value.email;
        rfcPfData.nombreCompleto = value.nombreCompleto;
      }),
      switchMap(() => this.getCodigoPostal$()),
      tap((value) => {
        rfcPfData.codigoPostal = value;
        rfcPfData.rfcResult =
          this.storageService.getItemValue('RFC_RESULT') ?? ''; // I'm assuming at this point it will always be string
      }),
      switchMap(() => this.getValidateCodigoPostal$()),
      tap((value: ValidateCodigoPostalSuccessFoundResponse) => {
        rfcPfData.asentamiento = value.Asentamiento;
        rfcPfData.ciudad = value.Ciudad;
        rfcPfData.claveDeOficina = value.ClaveDeOficina;
        rfcPfData.delegacionMunicipio = value.DelegacionMunicipio;
        rfcPfData.estado = value.Estado;
        rfcPfData.tipoDeAsentamiento = value.TipoDeAsentamiento;
      }),
      switchMap(() => of(rfcPfData))
    );
  }

  private initWithRfc() {}

  private getValidateCurpFoundResponse$(): Observable<ValidateCurpFoundResponse> {
    const cachedData: ValidateCurpFoundResponse =
      this.storageService.getItemValue('VALIDATE_CURP_FOUND_RESPONSE');

    if (cachedData) {
      return of(cachedData);
    }

    const curp = this.storageService.getItemValue('CURP') as string; // we assume it exists because it is a starting point.

    return this.curpService.validateCurp$({ curp }).pipe(
      switchMap((value) => {
        if (value.status === 'SUCCESS') {
          if (value.response.status === 'FOUND') {
            this.storageService.setItemValue(
              'VALIDATE_CURP_FOUND_RESPONSE',
              value.response
            );
            return of(value.response);
          }
          return throwError(
            () =>
              new Error(
                `Hubo un error al obtener al encontrar la CURP proporcionada: ${value.response.status}`
              )
          );
        }

        return throwError(
          () =>
            new Error(
              `Hubo un error al obtener al encontrar la CURP proporcionada: ${value.status}`
            )
        );
      })
    );
  }

  private getRfc$(): Observable<string> {
    const cachedData = this.storageService.getItemValue('RFC');

    if (cachedData) {
      return of(cachedData);
    }

    return this.getValidateCurpFoundResponse$().pipe(
      switchMap((value) => {
        const requestBody: GenerateRfcPfRequest = {
          nombres: value.nombres,
          apellidoPaterno: value.primerApellido,
          apellidoMaterno: value.segundoApellido,
          fechaNacimiento: value.fechaNacimiento,
        };

        return this.rfcService.generateRfcPF$(requestBody);
      }),
      switchMap((value) => {
        if (value.status === 'SUCCESS') {
          this.storageService.setItemValue('RFC', value.response.rfc);
          return of(value.response.rfc);
        }

        return throwError(
          () =>
            new Error(
              `Hubo un error al generar el RFC de Persona Física ${value.status}`
            )
        );
      })
    );
  }

  private obtainPersonalDataFromRfcPf$(): Observable<ObtainPersonalDataPfRfcSuccessFoundResponse> {
    const cachedData = this.storageService.getItemValue('RFC_PF_PERSONAL_DATA');

    if (cachedData) {
      return of(cachedData);
    }

    return this.getRfc$().pipe(
      switchMap((value) => this.rfcService.obtainPersonalDataRfcPF$(value)),
      switchMap((value) => {
        if (value.status === 'SUCCESS') {
          if (value.response.estatus === 'FOUND') {
            this.storageService.setItemValue(
              'RFC_PF_PERSONAL_DATA',
              value.response
            );
            return of(value.response);
          }

          return throwError(
            () =>
              new Error(
                `Hubo un error al obtener los datos personales con RFC de Persona Física: ${value.response.estatus}`
              )
          );
        }

        return throwError(
          () =>
            new Error(
              `Hubo un error al obtener los datos personales con RFC de Persona Física: ${value.status}`
            )
        );
      })
    );
  }

  private getCodigoPostal$(): Observable<string> {
    const cachedData = this.storageService.getItemValue('CODIGO_POSTAL');
    if (cachedData) {
      return of(cachedData);
    }

    const requestBody: Partial<ValidateRfcCpQueryRequest> = {};

    return this.getRfc$().pipe(
      tap((value) => (requestBody.rfc = value)),
      switchMap(() => this.obtainPersonalDataFromRfcPf$()),
      tap((value) => {
        requestBody.nombre = value.nombreCompleto;
      }),
      switchMap(() => this.getValidateCurpFoundResponse$()),
      tap((value) => {
        const claveEstado = value.datosDocProbatorio.claveEntidadRegistro;
        const claveMnpio = value.datosDocProbatorio.claveMunicipioRegistro;

        requestBody.estado = claveEstado;
        requestBody.municipio = claveMnpio;
      }),
      switchMap(() =>
        this.rfcService.cpQuery$(requestBody as Required<typeof requestBody>)
      ),
      switchMap((value) => {
        if (value.status === 'SUCCESS') {
          return of(value);
        }
        return throwError(
          () =>
            new Error(
              `Hubo un error al validar el RFC con datos: ${value.status}`
            )
        );
      }),
      switchMap((value) => {
        const finalResult =
          this.rfcService.getFinalResponse(value).response.rfcs[0];
        if (
          finalResult.result === 'RFC válido, y susceptible de recibir facturas'
        ) {
          this.storageService.setItemValue('RFC_RESULT', finalResult.result);
          this.storageService.setItemValue('CODIGO_POSTAL', finalResult.cp);
          return of(finalResult.cp);
        }

        return throwError(
          () =>
            new Error(
              `Hubo un error al validar el Código Postal: ${finalResult.result}`
            )
        );
      })
    );
  }

  private getValidateCodigoPostal$(): Observable<ValidateCodigoPostalSuccessFoundResponse> {
    const cachedData = this.storageService.getItemValue(
      'VALIDATE_CODIGO_POSTAL_RESPONSE'
    );

    if (cachedData) {
      return of(cachedData);
    }

    return this.getCodigoPostal$().pipe(
      switchMap((value) => this.rfcService.validateCodigoPostal$(value)),
      switchMap((value) => {
        if (value.status === 'SUCCESS') {
          if (value.response.length > 0) {
            this.storageService.setItemValue(
              'VALIDATE_CODIGO_POSTAL_RESPONSE',
              value.response[0]
            );
            return of(value.response[0]);
          }

          return throwError(
            () => new Error(`No se pudo validar el Código Postal`)
          );
        }

        return throwError(
          () =>
            new Error(
              `Hubo un error al validar el Código Postal ${value.statusText}`
            )
        );
      })
    );
  }
}
