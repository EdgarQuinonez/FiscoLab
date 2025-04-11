import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfcDataFormComponent } from './rfc-data-form.component';

describe('RfcDataFormComponent', () => {
  let component: RfcDataFormComponent;
  let fixture: ComponentFixture<RfcDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfcDataFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfcDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
