import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSelectPopUpComponent } from './text-select-pop-up.component';

describe('TextSelectPopUpComponent', () => {
  let component: TextSelectPopUpComponent;
  let fixture: ComponentFixture<TextSelectPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextSelectPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextSelectPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
