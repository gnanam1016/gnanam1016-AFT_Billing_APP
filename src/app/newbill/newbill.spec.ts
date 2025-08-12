import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newbill } from './newbill';

describe('Newbill', () => {
  let component: Newbill;
  let fixture: ComponentFixture<Newbill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newbill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newbill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
