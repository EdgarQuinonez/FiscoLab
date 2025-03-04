import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Curp, CurpBadRequestResponse } from './curp.interface';

export function curpFoundValidator(curpResponse: Curp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (curpResponse.status === 'SERVICE_ERROR') {
      return { curpFound: curpResponse.errorMessage };
    } else if (curpResponse.status === 'SUCCESS') {
      if (curpResponse.response.status === 'FOUND') {
        return null;
      } else if (curpResponse.response.status === 'NOT_FOUND') {
        return {
          curpFound: 'La CURP introducida no está registrada en la RENAPO.',
        };
      } else if (curpResponse.response.status === 'NOT_VALID') {
        return {
          curpFound: `La CURP introducida no es válida. Código: ${curpResponse.response.statusCurp}`,
        };
      }
      // Validating http errors
    }
    // Casting because there SERVICE_ERROR and SUCCESS cases are already handled. Leaving only the number (http codes).
    return { curpFound: (curpResponse as CurpBadRequestResponse).error[0].message };
  };
}
