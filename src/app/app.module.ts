import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './/app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { CropperComponent } from './cropper/cropper.component';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';
import { TabsComponent } from './tabs/tabs.component';
import { BinarizationComponent } from './binarization/binarization.component';
import { AboutComponent } from './about/about.component';
import { TextSelectPopUpComponent } from './text-select-pop-up/text-select-pop-up.component';
import { ImageInfoComponent } from './image-info/image-info.component';

@NgModule({
  declarations: [
    AppComponent,
    CropperComponent,
    ToolbarSidenavComponent,
    TabsComponent,
    BinarizationComponent,
    AboutComponent,
    TextSelectPopUpComponent,
    ImageInfoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    LayoutModule,
    AppRoutingModule,
    FontAwesomeModule,
    AngularCropperjsModule
  ],
  entryComponents: [
    TextSelectPopUpComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
