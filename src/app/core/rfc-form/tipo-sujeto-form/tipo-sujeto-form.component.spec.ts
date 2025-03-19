import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoSujetoFormComponent } from './tipo-sujeto-form.component';

describe('TipoSujetoFormComponent', () => {
  let component: TipoSujetoFormComponent;
  let fixture: ComponentFixture<TipoSujetoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoSujetoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoSujetoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
