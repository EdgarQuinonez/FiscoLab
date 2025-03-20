import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoSujetoControlComponent } from './tipo-sujeto-control.component';

describe('TipoSujetoControlComponent', () => {
  let component: TipoSujetoControlComponent;
  let fixture: ComponentFixture<TipoSujetoControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoSujetoControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoSujetoControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
