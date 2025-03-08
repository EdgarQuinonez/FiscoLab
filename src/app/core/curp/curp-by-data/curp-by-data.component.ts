import { Component } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import curpCatalog from '@core/curp/curp.catalog.json';
import { Gender, GenderCode } from '../curp.interface';

@Component({
  selector: 'app-curp-by-data',
  imports: [InputText, DatePickerModule, AutoCompleteModule],
  templateUrl: './curp-by-data.component.html',
  styleUrl: './curp-by-data.component.scss',
})
export class CurpByDataComponent {
  gender: {
    name: string;
    code: string;
  }[] = [];

  states: {
    name: string;
    code: string;
  }[] = [];

  ngOnInit() {
    // init gender
    for (const [code, name] of Object.entries(curpCatalog.GENDER)) {
      this.gender.push({
        name,
        code,
      });
    }

    // init states
    for (const [code, name] of Object.entries(curpCatalog.STATES)) {
      this.states.push({
        name,
        code,
      });
    }

    console.log(this.gender);
    console.log(this.states);
  }
}
