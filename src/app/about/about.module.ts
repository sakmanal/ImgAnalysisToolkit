import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: AboutComponent}]),
    MaterialModule,
    FontAwesomeModule,
  ],
  declarations: [AboutComponent],
})
export class AboutModule {}
