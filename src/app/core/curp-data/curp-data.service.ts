import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CurpService } from '@shared/services/curp.service';
import { ValidateCurpFoundResponse } from '@shared/services/curp.service.interface';
import { StorageService } from '@shared/services/storage.service';
import { StorageKey, LOCAL_STORAGE_KEYS } from '@shared/types';
import { catchError, Observable, of, switchMap, throwError, tap } from 'rxjs';
import { CurpDataData } from './curp-data.interface';
import {
  GenerateRfcPfRequest,
  ObtainPersonalDataPfRfcSuccessFoundResponse,
} from '@shared/services/rfc.service.interface';
import { RfcService } from '@shared/services/rfc.service';

@Injectable({
  providedIn: 'root',
})
export class CurpDataService {
  constructor(
    private storageService: StorageService,
    private curpService: CurpService,
    private rfcService: RfcService,
    private router: Router
  ) {}

  getCurpData$() {
    const startingPoint = this.getStartingPoint();

    if (!startingPoint) {
      throw new Error(
        'No se encuentra disponible el punto de partida (RFC o CURP).'
      );
    }

    if (startingPoint === 'RFC') {
      return this.initWithRfc$();
    }

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

  private initWithRfc$() {
    const curpData: Partial<CurpDataData> = {};

    // We assume RFC key exists and then set CURP key to continue normally.
    return this.getRfc$().pipe(
      switchMap(() => this.obtainPersonalDataFromRfcPf$()),
      tap((value) => {
        this.storageService.setItemValue('CURP', value.curp);
        curpData.nombreCompleto = value.nombreCompleto;
      }),
      switchMap(() => this.getValidateCurpFoundResponse$()),
      tap((value) => {
        // Map all the CURP data to our interface
        curpData.sexo = value.sexo;
        curpData.fechaNacimiento = value.fechaNacimiento;
        curpData.entidad = value.entidad;
        curpData.nombres = value.nombres;
        curpData.apellidoPaterno = value.primerApellido;
        curpData.apellidoMaterno = value.segundoApellido;
        curpData.curp = value.curp;
        curpData.claveEntidad = value.claveEntidad;
        curpData.datosDocProbatorio = value.datosDocProbatorio;
        curpData.docProbatorio = value.docProbatorio;
        curpData.docProbatorioDescripcion = value.docProbatorioDescripcion;
        curpData.nacionalidad = value.nacionalidad;
        curpData.primerApellido = value.primerApellido;
        curpData.segundoApellido = value.segundoApellido;
        curpData.statusCurp = value.statusCurp;
        curpData.statusCurpDescripcion = value.statusCurpDescripcion;
      }),
      switchMap(() => of(curpData as Required<CurpDataData>))
    );
  }

  private initWithCurp$(): Observable<CurpDataData> {
    const curpData: Partial<CurpDataData> = {};

    return this.getValidateCurpFoundResponse$().pipe(
      tap((value) => {
        // Map all the CURP data to our interface
        curpData.sexo = value.sexo;
        curpData.fechaNacimiento = value.fechaNacimiento;
        curpData.entidad = value.entidad;
        curpData.nombres = value.nombres;
        curpData.apellidoPaterno = value.primerApellido;
        curpData.apellidoMaterno = value.segundoApellido;
        curpData.curp = value.curp;
        curpData.claveEntidad = value.claveEntidad;
        curpData.datosDocProbatorio = value.datosDocProbatorio;
        curpData.docProbatorio = value.docProbatorio;
        curpData.docProbatorioDescripcion = value.docProbatorioDescripcion;
        curpData.nacionalidad = value.nacionalidad;
        curpData.primerApellido = value.primerApellido;
        curpData.segundoApellido = value.segundoApellido;
        curpData.statusCurp = value.statusCurp;
        curpData.statusCurpDescripcion = value.statusCurpDescripcion;
      }),
      switchMap(() => this.obtainPersonalDataFromRfcPf$()),
      tap((value) => {
        curpData.nombreCompleto = value.nombreCompleto;
      }),
      switchMap(() => of(curpData as Required<CurpDataData>))
    );
  }

  private getValidateCurpFoundResponse$(): Observable<ValidateCurpFoundResponse> {
    const cachedData: ValidateCurpFoundResponse =
      this.storageService.getItemValue('VALIDATE_CURP_FOUND_RESPONSE');

    if (cachedData) {
      return of(cachedData);
    }

    const curp = this.storageService.getItemValue('CURP') as string;

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
              new Error(`Error al validar la CURP: ${value.response.status}`)
          );
        }

        return throwError(
          () => new Error(`Error al validar la CURP: ${value.status}`)
        );
      }),
      catchError((error) => {
        console.error('Error validating CURP:', error);
        return throwError(() => error);
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
}
