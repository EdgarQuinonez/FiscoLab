import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  Curp,
  CurpBadRequestResponse,
  CurpServiceUnavailableResponse,
} from './curp.interface';
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
          this.curpService.setCurpResponse(value); // Share the response on the CurpService public var
          return of(getCurpValidationError(value)); // On SUCCESS, handle NOT_FOUND or NOT_VALID cases
        }),
        catchError(
          (err: CurpBadRequestResponse | CurpServiceUnavailableResponse) => {
            // Emit HTTP errors or SERVICE_ERROR

            console.log('Backend error: ', err);
            return of({ curpValidAndFound: err });
          }
        )
      );
    }
  }
}

function getCurpValidationError(
  curpResponse: Curp
): { curpFoundAndValid: string } | null {
  if (curpResponse.status === 'SUCCESS') {
    if (curpResponse.response.status === 'NOT_FOUND') {
      return {
        curpFoundAndValid:
          'La CURP introducida no está registrada en la RENAPO.',
      };
    }
    if (curpResponse.response.status === 'NOT_VALID') {
      return {
        curpFoundAndValid: `La CURP introducida no es válida. Código: ${curpResponse.response.statusCurp}`,
      };
    }
  }

  return null;
}

// function getCurpValidationError(
//   curpResponse: Curp
// ): { curpFoundAndValid: string } | null {
//   if (curpResponse.status === 'SERVICE_ERROR') {
//     return { curpFoundAndValid: curpResponse.errorMessage };
//   } else if (curpResponse.status === 'SUCCESS') {
//     if (curpResponse.response.status === 'FOUND') {
//       return null;
//     } else if (curpResponse.response.status === 'NOT_FOUND') {
//       return {
//         curpFoundAndValid:
//           'La CURP introducida no está registrada en la RENAPO.',
//       };
//     } else if (curpResponse.response.status === 'NOT_VALID') {
//       return {
//         curpFoundAndValid: `La CURP introducida no es válida. Código: ${curpResponse.response.statusCurp}`,
//       };
//     }
//   }

//   return null
// }
