import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurpComponent } from './curp.component';

describe('CurpComponent', () => {
  let component: CurpComponent;
  let fixture: ComponentFixture<CurpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
