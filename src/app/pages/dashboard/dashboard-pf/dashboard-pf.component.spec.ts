import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPfComponent } from './dashboard-pf.component';

describe('DashboardPfComponent', () => {
  let component: DashboardPfComponent;
  let fixture: ComponentFixture<DashboardPfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
