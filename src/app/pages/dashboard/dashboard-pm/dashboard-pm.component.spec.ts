import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPmComponent } from './dashboard-pm.component';

describe('DashboardPmComponent', () => {
  let component: DashboardPmComponent;
  let fixture: ComponentFixture<DashboardPmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
