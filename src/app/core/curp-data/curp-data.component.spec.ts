import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurpDataComponent } from './curp-data.component';

describe('CurpDataComponent', () => {
  let component: CurpDataComponent;
  let fixture: ComponentFixture<CurpDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurpDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurpDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
