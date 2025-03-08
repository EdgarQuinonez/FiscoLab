import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurpByDataComponent } from './curp-by-data.component';

describe('CurpByDataComponent', () => {
  let component: CurpByDataComponent;
  let fixture: ComponentFixture<CurpByDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurpByDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurpByDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
