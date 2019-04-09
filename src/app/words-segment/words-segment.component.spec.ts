import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsSegmentComponent } from './words-segment.component';

describe('WordsSegmentComponent', () => {
  let component: WordsSegmentComponent;
  let fixture: ComponentFixture<WordsSegmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordsSegmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordsSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
