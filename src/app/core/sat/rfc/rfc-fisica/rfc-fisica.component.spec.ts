import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfcFisicaComponent } from './rfc-fisica.component';

describe('RfcFisicaComponent', () => {
  let component: RfcFisicaComponent;
  let fixture: ComponentFixture<RfcFisicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfcFisicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfcFisicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
