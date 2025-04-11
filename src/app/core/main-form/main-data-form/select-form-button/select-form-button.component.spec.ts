import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFormButtonComponent } from './select-form-button.component';

describe('SelectFormButtonComponent', () => {
  let component: SelectFormButtonComponent;
  let fixture: ComponentFixture<SelectFormButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFormButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFormButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
