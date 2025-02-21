import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuroFisicaComponent } from './buro-fisica.component';

describe('BuroFisicaComponent', () => {
  let component: BuroFisicaComponent;
  let fixture: ComponentFixture<BuroFisicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuroFisicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuroFisicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
