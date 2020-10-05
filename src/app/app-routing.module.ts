import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';

const routes: Routes = [
  { path: '', redirectTo: 'ImgAnalysisToolkit', pathMatch: 'full' },
  { path: 'ImgAnalysisToolkit', component: TabsComponent},
  {
    path: 'about',
    loadChildren: './about/about.module#AboutModule'
  }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}
