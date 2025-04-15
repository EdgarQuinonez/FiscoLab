import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfcPfComponent } from './rfc-pf.component';

describe('RfcPfComponent', () => {
  let component: RfcPfComponent;
  let fixture: ComponentFixture<RfcPfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfcPfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfcPfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
