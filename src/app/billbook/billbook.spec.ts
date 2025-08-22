import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Billbook } from './billbook';

describe('Billbook', () => {
  let component: Billbook;
  let fixture: ComponentFixture<Billbook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Billbook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Billbook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
