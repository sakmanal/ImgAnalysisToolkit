import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarSidenavComponent } from './toolbar-sidenav.component';

describe('ToolbarSidenavComponent', () => {
  let component: ToolbarSidenavComponent;
  let fixture: ComponentFixture<ToolbarSidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarSidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
