import { NgModule } from '@angular/core';

import { MatButtonModule, MatToolbarModule, 
         MatProgressSpinnerModule, MatCardModule, 
         MatInputModule, MatIconModule, MatMenuModule, 
         MatSidenavModule, MatListModule, MatTooltipModule, 
         MatTabsModule, MatSlideToggleModule, MatSliderModule, 
         MatCheckboxModule, MatDialogModule, MatSelectModule, 
         MatDividerModule, MatExpansionModule, MatTableModule, 
         MatPaginatorModule, MatButtonToggleModule} from '@angular/material';
         
@NgModule({
  imports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatDialogModule, 
            MatSelectModule, MatDividerModule, MatExpansionModule, MatTableModule, 
            MatPaginatorModule, MatButtonToggleModule],

  exports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatDialogModule, 
            MatSelectModule, MatDividerModule, MatExpansionModule, MatTableModule, 
            MatPaginatorModule, MatButtonToggleModule],
})
export class MaterialModule { }
