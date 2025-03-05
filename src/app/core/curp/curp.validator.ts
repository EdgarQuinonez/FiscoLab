import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Curp, CurpBadRequestResponse } from './curp.interface';
import { Injectable } from '@angular/core';
import { CurpService } from './curp.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurpFoundAndValidValidator implements AsyncValidator {
  constructor(private curpService: CurpService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    {
      return this.curpService.validateCURP$(control.value).pipe(
        switchMap((value) => {
          this.curpService.setCurpResponse(value); // Cache the response on the CurpService public var
          return of(getCurpValidationError(value));
        }),
        catchError(() => of(null))
      );
    }
  }
}

function getCurpValidationError(
  curpResponse: Curp
): { curpFoundAndValid: string } | null {
  if (curpResponse.status === 'SERVICE_ERROR') {
    return { curpFoundAndValid: curpResponse.errorMessage };
  } else if (curpResponse.status === 'SUCCESS') {
    if (curpResponse.response.status === 'FOUND') {
      return null;
    } else if (curpResponse.response.status === 'NOT_FOUND') {
      return {
        curpFoundAndValid:
          'La CURP introducida no está registrada en la RENAPO.',
      };
    } else if (curpResponse.response.status === 'NOT_VALID') {
      return {
        curpFoundAndValid: `La CURP introducida no es válida. Código: ${curpResponse.response.statusCurp}`,
      };
    }
  }
  // Validating http errors
  return {
    curpFoundAndValid: (curpResponse as CurpBadRequestResponse).error[0]
      .message,
  };
}
