import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Itemmaster } from './itemmaster';

describe('Itemmaster', () => {
  let component: Itemmaster;
  let fixture: ComponentFixture<Itemmaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Itemmaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Itemmaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
