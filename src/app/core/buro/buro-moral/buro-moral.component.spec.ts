import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuroMoralComponent } from './buro-moral.component';

describe('BuroMoralComponent', () => {
  let component: BuroMoralComponent;
  let fixture: ComponentFixture<BuroMoralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuroMoralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuroMoralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
