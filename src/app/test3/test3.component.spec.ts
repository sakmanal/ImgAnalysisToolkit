import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Test3Component } from './test3.component';

describe('Test3Component', () => {
  let component: Test3Component;
  let fixture: ComponentFixture<Test3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Test3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Test3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
