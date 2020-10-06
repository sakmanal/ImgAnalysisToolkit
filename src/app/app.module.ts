import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './/app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';
import { TabsComponent } from './tabs/tabs.component';
import { BinarizationComponent } from './binarization/binarization.component';
import { ImageInfoComponent } from './image-info/image-info.component';
import { MouseWheelDirective } from './mousewheel.directive';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WordsSegmentComponent } from './words-segment/words-segment.component';
import { WordSnackBarComponent } from './word-snack-bar/word-snack-bar.component';
import { TestComponent } from './multiple-processing/multiple-processing.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarSidenavComponent,
    TabsComponent,
    BinarizationComponent,
    ImageInfoComponent,
    MouseWheelDirective,
    WordsSegmentComponent,
    WordSnackBarComponent,
    TestComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    LayoutModule,
    AppRoutingModule,
    FontAwesomeModule,
    FlexLayoutModule
  ],
  entryComponents: [
    WordSnackBarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
