import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { MatButtonModule, MatToolbarModule, 
         MatProgressSpinnerModule, MatCardModule, 
         MatInputModule, MatIconModule, MatMenuModule, 
         MatSidenavModule, MatListModule, MatTooltipModule, 
         MatTabsModule, MatSlideToggleModule, MatSliderModule, 
         MatCheckboxModule, MatDialogModule, MatSelectModule, 
         MatDividerModule, MatExpansionModule, MatTableModule, MatPaginatorModule} from '@angular/material';
         
@NgModule({
  imports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatDialogModule, 
            MatSelectModule, MatDividerModule, MatExpansionModule, MatTableModule, MatPaginatorModule],

  exports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule, MatDialogModule, 
            MatSelectModule, MatDividerModule, MatExpansionModule, MatTableModule, MatPaginatorModule],
})
export class MaterialModule { }
