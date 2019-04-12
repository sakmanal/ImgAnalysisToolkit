import { Component, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';

@Component({
  selector: 'app-word-snack-bar',
  templateUrl: './word-snack-bar.component.html'
})
export class WordSnackBarComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

}
