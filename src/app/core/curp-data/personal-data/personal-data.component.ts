import { Component } from '@angular/core';
import { CurpDataService } from '../curp-data.service';
import { LoadingState } from '@shared/types';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { Observable, of } from 'rxjs';
import { CurpDataData } from '../curp-data.interface';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-personal-data',
  imports: [AsyncPipe],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
})
export class PersonalDataComponent {
  constructor(private curpDataService: CurpDataService) {}

  data!: Observable<LoadingState<CurpDataData>>;

  ngOnInit() {
    this.data = of(null).pipe(
      switchMapWithLoading<CurpDataData>(() =>
        this.curpDataService.getCurpData$()
      )
    );
  }
}
