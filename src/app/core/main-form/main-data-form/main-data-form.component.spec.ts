import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDataFormComponent } from './main-data-form.component';

describe('MainDataFormComponent', () => {
  let component: MainDataFormComponent;
  let fixture: ComponentFixture<MainDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDataFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
