import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCpFormComponent } from './query-cp-form.component';

describe('QueryCpFormComponent', () => {
  let component: QueryCpFormComponent;
  let fixture: ComponentFixture<QueryCpFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryCpFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryCpFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
