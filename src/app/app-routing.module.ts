import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CropperComponent } from './cropper/cropper.component';
import { TabsComponent } from './tabs/tabs.component';
import { AboutComponent } from './about/about.component';


const routes: Routes = [
  //{ path: '', redirectTo: '/TextSelection', pathMatch: 'full' },
  { path: 'TextSelection', component: CropperComponent},
  { path: '', component: TabsComponent},
  { path: 'about', component: AboutComponent}

];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
  })
  export class AppRoutingModule {}
  