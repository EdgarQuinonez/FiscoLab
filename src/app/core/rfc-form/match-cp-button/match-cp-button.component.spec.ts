import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchCpButtonComponent } from './match-cp-button.component';

describe('MatchCpButtonComponent', () => {
  let component: MatchCpButtonComponent;
  let fixture: ComponentFixture<MatchCpButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchCpButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchCpButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
