import { Component } from '@angular/core';
import { CurpDataComponent } from '@core/curp-data/curp-data.component';
import { RfcPfComponent } from '@core/rfc-pf/rfc-pf.component';

@Component({
  selector: 'app-dashboard-pf',
  imports: [RfcPfComponent, CurpDataComponent],
  templateUrl: './dashboard-pf.component.html',
  styleUrl: './dashboard-pf.component.scss',
})
export class DashboardPfComponent {}
