import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { AboutComponent } from './about/about.component';
import { Test2Component } from './test2/test2.component';
import { Test3Component } from './test3/test3.component';

const routes: Routes = [
  { path: '', redirectTo: 'ImgAnalysisToolkit', pathMatch: 'full' },
  { path: 'ImgAnalysisToolkit', component: TabsComponent},
  //{ path: '', component: TabsComponent},
  { path: 'about', component: AboutComponent},
  { path: 'test2', component: Test2Component},
  { path: 'test3', component: Test3Component}
  

];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}
  