import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map, Observable, of, switchMap } from 'rxjs';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@types';
import { CurpDataService } from './curp-data.service';
import { CurpDataData } from './curp-data.interface';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-curp-data',
  imports: [AsyncPipe, ButtonModule, TableModule],
  templateUrl: './curp-data.component.html',
  styleUrl: './curp-data.component.scss',
  standalone: true,
})
export class CurpDataComponent {
  constructor(private curpDataService: CurpDataService) {}

  data$!: Observable<LoadingState<CurpDataData>>;

  private documentoProbatorioNames: Record<
    keyof CurpDataData['datosDocProbatorio'],
    string
  > = {
    anioReg: 'Año de registro',
    claveEntidadRegistro: 'Clave entidad registro',
    claveMunicipioRegistro: 'Clave municipio registro',
    entidadRegistro: 'Entidad registro',
    municipioRegistro: 'Municipio registro',
    numActa: 'Número de acta',
  };

  private documentoProbatorioOrder: (keyof CurpDataData['datosDocProbatorio'])[] =
    [
      'anioReg',
      'entidadRegistro',
      'claveEntidadRegistro',
      'municipioRegistro',
      'claveMunicipioRegistro',
      'numActa',
    ];

  documentoProbatorio$!: Observable<{ name: string; content: string }[] | null>;

  ngOnInit() {
    this.data$ = of(null).pipe(
      switchMapWithLoading<CurpDataData>(() =>
        this.curpDataService.getCurpData$()
      )
    );

    this.documentoProbatorio$ = this.data$.pipe(
      map((value) => {
        if (!value?.data?.datosDocProbatorio) return null;

        const docProbatorioData = value.data.datosDocProbatorio;
        return this.documentoProbatorioOrder.map((key) => {
          return {
            name: this.documentoProbatorioNames[key],
            content: docProbatorioData[key]?.toString() || '',
          };
        });
      })
    );
  }
}
