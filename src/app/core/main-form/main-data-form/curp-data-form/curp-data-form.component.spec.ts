import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurpDataFormComponent } from './curp-data-form.component';

describe('CurpDataFormComponent', () => {
  let component: CurpDataFormComponent;
  let fixture: ComponentFixture<CurpDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurpDataFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurpDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
