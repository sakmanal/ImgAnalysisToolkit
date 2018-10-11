import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatToolbarModule, 
         MatProgressSpinnerModule, MatCardModule, 
         MatInputModule, MatIconModule, MatMenuModule, 
         MatSidenavModule, MatListModule, MatTooltipModule, 
         MatTabsModule, MatSlideToggleModule, MatSliderModule, MatCheckboxModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule],
  exports: [MatButtonModule, MatToolbarModule, MatProgressSpinnerModule,
            MatCardModule, MatInputModule, MatIconModule, MatMenuModule, 
            MatSidenavModule, MatListModule, MatTooltipModule, MatTabsModule, 
            MatSlideToggleModule, MatSliderModule, MatCheckboxModule],
})
export class MaterialModule { }
