import { Component } from '@angular/core';
import { CurpDataComponent } from '@core/curp-data/curp-data.component';
import { CurpDataData } from '@core/curp-data/curp-data.interface';
import { CurpDataService } from '@core/curp-data/curp-data.service';
import { PersonalDataComponent } from '@core/curp-data/personal-data/personal-data.component';
import { PersonalDataData } from '@core/curp-data/personal-data/personal-data.interface';
import { RfcPfComponent } from '@core/rfc-pf/rfc-pf.component';
import { RfcPfData } from '@core/rfc-pf/rfc-pf.interface';
import { RfcPfService } from '@core/rfc-pf/rfc-pf.service';
import { LoadingState } from '@shared/types';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard-pf',
  imports: [RfcPfComponent, CurpDataComponent, PersonalDataComponent],
  templateUrl: './dashboard-pf.component.html',
  styleUrl: './dashboard-pf.component.scss',
})
export class DashboardPfComponent {
  curpData$!: Observable<LoadingState<CurpDataData>>;
  rfcPfData$!: Observable<LoadingState<RfcPfData>>;
  personalData$!: Observable<LoadingState<PersonalDataData>>;

  constructor(
    private curpDataService: CurpDataService,
    private rfcPfService: RfcPfService
  ) {}

  ngOnInit() {
    this.curpData$ = of(null).pipe(
      switchMapWithLoading<CurpDataData>(() =>
        this.curpDataService.getCurpData$()
      )
    );

    this.personalData$! = this.curpData$.pipe(
      switchMapWithLoading<PersonalDataData>(() =>
        this.curpDataService.getCurpData$()
      )
    );

    this.rfcPfData$ = this.curpData$.pipe(
      switchMapWithLoading<RfcPfData>(() => this.rfcPfService.getRfcPfData$())
    );
  }
}
