import { NgModule } from '@angular/core';

import { MatButtonModule, MatToolbarModule,      
         MatInputModule, MatIconModule, 
         MatSidenavModule, MatTooltipModule, MatPaginatorModule,
         MatTabsModule, MatSlideToggleModule, MatSliderModule, 
         MatCheckboxModule, MatSelectModule, MatExpansionModule, 
         MatTableModule, MatButtonToggleModule, MatSnackBarModule} from '@angular/material';
         
@NgModule({
  imports: [MatButtonModule, MatToolbarModule, MatPaginatorModule,
            MatInputModule, MatIconModule, MatExpansionModule,
            MatSidenavModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, 
            MatSelectModule, MatTableModule, MatButtonToggleModule, MatSnackBarModule],

  exports: [MatButtonModule, MatToolbarModule, MatPaginatorModule,
            MatInputModule, MatIconModule, MatExpansionModule,
            MatSidenavModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, 
            MatSelectModule,  MatTableModule, MatButtonToggleModule, MatSnackBarModule],
})
export class MaterialModule { }
