import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { AboutComponent } from './about/about.component';


const routes: Routes = [
  { path: '', redirectTo: 'ImgAnalysisToolkit', pathMatch: 'full' },
  { path: 'ImgAnalysisToolkit', component: TabsComponent},
  //{ path: '', component: TabsComponent},
  { path: 'about', component: AboutComponent}

  

];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}
  