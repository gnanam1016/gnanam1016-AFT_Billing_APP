import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quickbill } from './quickbill';

describe('Quickbill', () => {
  let component: Quickbill;
  let fixture: ComponentFixture<Quickbill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quickbill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quickbill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
