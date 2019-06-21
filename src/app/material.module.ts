import { NgModule } from '@angular/core';

import { MatButtonModule, MatToolbarModule,      
         MatInputModule, MatIconModule, MatProgressBarModule,
         MatSidenavModule, MatTooltipModule, MatPaginatorModule,
         MatTabsModule, MatSlideToggleModule, MatSliderModule, 
         MatCheckboxModule, MatSelectModule, MatExpansionModule, MatCardModule, 
         MatTableModule, MatButtonToggleModule, MatSnackBarModule} from '@angular/material';
         
@NgModule({
  imports: [MatButtonModule, MatToolbarModule, MatPaginatorModule,
            MatInputModule, MatIconModule, MatExpansionModule, MatProgressBarModule,
            MatSidenavModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatCardModule, 
            MatSelectModule, MatTableModule, MatButtonToggleModule, MatSnackBarModule],

  exports: [MatButtonModule, MatToolbarModule, MatPaginatorModule,
            MatInputModule, MatIconModule, MatExpansionModule, MatProgressBarModule,
            MatSidenavModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatCardModule,
            MatSelectModule,  MatTableModule, MatButtonToggleModule, MatSnackBarModule],
})
export class MaterialModule { }
