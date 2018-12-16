import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CropperComponent } from './cropper/cropper.component';
import { TabsComponent } from './tabs/tabs.component';
import { AboutComponent } from './about/about.component';
import { TestComponent } from './test/test.component';
import { Test2Component } from './test2/test2.component';

const routes: Routes = [
  { path: '', redirectTo: 'ImgAnalysisToolkit', pathMatch: 'full' },
  { path: 'TextSelection', component: CropperComponent},
  { path: 'ImgAnalysisToolkit', component: TabsComponent},
  //{ path: '', component: TabsComponent},
  { path: 'about', component: AboutComponent},
  { path: 'test', component: TestComponent},
  { path: 'test2', component: Test2Component}
  

];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}
  