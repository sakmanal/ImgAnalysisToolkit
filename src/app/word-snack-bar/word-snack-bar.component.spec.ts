import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordSnackBarComponent } from './word-snack-bar.component';

describe('WordSnackBarComponent', () => {
  let component: WordSnackBarComponent;
  let fixture: ComponentFixture<WordSnackBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordSnackBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
