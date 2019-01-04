import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-text-select-pop-up',
  templateUrl: './text-select-pop-up.component.html',
  styleUrls: ['./text-select-pop-up.component.css']
})
export class TextSelectPopUpComponent  {

   

  constructor(
    public dialogRef: MatDialogRef<TextSelectPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {}

    value:string;

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  add(){
     //this.data.word = this.value;
     //console.log(this.value)
     if (this.value){
         this.dialogRef.close(`${this.value}`);
      }
  }
 
 
}
