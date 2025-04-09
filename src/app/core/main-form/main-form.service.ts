import { Injectable } from '@angular/core';
import { RfcService } from '@shared/services/rfc.service'
import { CurpService } from '@shared/services/curp.service'
import { RFC } from '@shared/services/rfc.service.interface'
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading'
import { of } from 'rxjs'
import { MainFormValue } from '@core/main-form/main-form.interface'
import { Curp } from '@shared/services/curp.service.interface';


@Injectable({
  providedIn: 'root'
})
export class MainFormService {
  constructor(private rfcService: RfcService, private curpService: CurpService) { }

  validateRfc$(formValue: MainFormValue) {
    return of(null).pipe(
      switchMapWithLoading<RFC>(() =>
        this.rfcService.validateRfc$({ rfcs: [{ rfc: formValue.clave }] })
      )
    );
  }

  validateCurp$(formValue: MainFormValue) {
    return of(null).pipe(
      switchMapWithLoading<Curp>(() => this.curpService.validateCurp$({ curp: formValue.clave }))
    )
  }


}
