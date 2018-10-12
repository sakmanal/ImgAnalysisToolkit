import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinarizationComponent } from './binarization.component';

describe('BinarizationComponent', () => {
  let component: BinarizationComponent;
  let fixture: ComponentFixture<BinarizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinarizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinarizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
