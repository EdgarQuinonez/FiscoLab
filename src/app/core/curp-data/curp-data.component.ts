import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@types';
import { CurpDataService } from './curp-data.service';
import { CurpDataData } from './curp-data.interface';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-curp-data',
  imports: [AsyncPipe, ButtonModule],
  templateUrl: './curp-data.component.html',
  styleUrl: './curp-data.component.scss',
  standalone: true,
})
export class CurpDataComponent {
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
