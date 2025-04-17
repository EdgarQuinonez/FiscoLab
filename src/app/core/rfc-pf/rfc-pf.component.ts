import { Component } from '@angular/core';
import { RfcPfService } from './rfc-pf.service';
import { map, Observable, of } from 'rxjs';
import {
  CodigoPostalData,
  MediosContactoData,
  RfcPfData,
} from './rfc-pf.interface';
import { switchMapWithLoading } from '@shared/utils/switchMapWithLoading';
import { LoadingState } from '@shared/types';
import { AsyncPipe } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-rfc-pf',
  imports: [AsyncPipe, TableModule],
  templateUrl: './rfc-pf.component.html',
  styleUrl: './rfc-pf.component.scss',
})
export class RfcPfComponent {
  constructor(private rfcPfService: RfcPfService) {}

  data$!: Observable<LoadingState<RfcPfData>>;

  // Codigo Postal
  private codigoPostalNames: Record<keyof CodigoPostalData, string> = {
    codigoPostal: 'Código Postal',
    claveDeOficina: 'Clave de Oficina',
    asentamiento: 'Asentamiento',
    tipoDeAsentamiento: 'Tipo de Asentamiento',
    ciudad: 'Ciudad',
    delegacionMunicipio: 'Delegación/Municipio',
    estado: 'Estado',
  };

  private codigoPostalOrder: (keyof CodigoPostalData)[] = [
    'codigoPostal',
    'asentamiento',
    'ciudad',
    'delegacionMunicipio',
    'estado',
    'tipoDeAsentamiento',
    'claveDeOficina',
  ];

  codigoPostalData$!: Observable<{ name: string; content: string }[] | null>;

  // Medios de Contacto
  private mediosContactoNames: Record<keyof MediosContactoData, string> = {
    email: 'Correo electrónico',
  };

  private mediosContactoOrder: (keyof MediosContactoData)[] = ['email'];

  mediosContacto$!: Observable<{ name: string; content: string }[] | null>;

  ngOnInit() {
    this.data$ = of(null).pipe(
      switchMapWithLoading<RfcPfData>(() => this.rfcPfService.getRfcPfData$())
    );

    this.codigoPostalData$ = this.data$.pipe(
      map((value) => {
        if (!value?.data) return null;

        const cpData: CodigoPostalData = {
          codigoPostal: value.data.codigoPostal,
          asentamiento: value.data.asentamiento,
          ciudad: value.data.ciudad,
          claveDeOficina: value.data.claveDeOficina,
          delegacionMunicipio: value.data.delegacionMunicipio,
          estado: value.data.estado,
          tipoDeAsentamiento: value.data.tipoDeAsentamiento,
        };

        return this.codigoPostalOrder.map((key) => ({
          name: this.codigoPostalNames[key],
          content: cpData[key]?.toString() || '',
        }));
      })
    );

    this.mediosContacto$ = this.data$.pipe(
      map((value) => {
        if (!value?.data) return null;

        const contactData: MediosContactoData = {
          email: value.data.email,
        };

        return this.mediosContactoOrder.map((key) => ({
          name: this.mediosContactoNames[key],
          content: contactData[key]?.toString() || '',
        }));
      })
    );
  }
}
