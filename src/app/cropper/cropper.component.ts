import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { AngularCropperjsComponent } from 'angular-cropperjs';
import { MatDialog } from '@angular/material';
import { TextSelectPopUpComponent } from '../text-select-pop-up/text-select-pop-up.component';

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.css']
})
export class CropperComponent implements OnInit  {


  @ViewChild('angularCropper') public angularCropper: AngularCropperjsComponent;
  config ={
    viewMode: 1,         // viewMode to 0, the crop box can extend outside the canvas, while a value of 1, 2 or 3 will restrict the crop box to the size of the canvas.
    modal:false,         //Show the black modal above the image and under the crop box.
    responsive:true,     //Re-render the cropper when resize the window.
    restore:false,       //Restore the cropped area after resize the window.
    background: false,   // Show the grid background
    movable:true,        //Enable to move the image.
    zoomable:true,       //Enable to zoom the image.
    wheelZoomRatio: 0.1, //Define zoom ratio when zoom the image by wheeling mouse.
    autoCropArea:0.1,    //A number between 0 and 1. Define the automatic cropping area size (percentage).
    guides:false,        //Show the dashed lines above the crop box.
    dragMode:'crop',      //'crop': create a new crop box, 'move': move the canvas, 'none': do nothing
    
  };
  
  @Input() imageUrl: any;
  resultImage: any;
  resultResult: any;
  flag=true;
  word:string;

  constructor(public dialog: MatDialog) {}

  ngOnInit(){
    this.CropMe;
    console.log("ok")
  }

  openDialog(): void {
    this.resultImageFun();
    const dialogRef = this.dialog.open(TextSelectPopUpComponent, {
      width: '350px',
      data: { word: this.word, CroppedImage: this.resultResult}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.word = result;
      console.log(this.word);
      this.word='';
    });
  }
 
 

 /*onFileAdded(event){
  this.flag = false;
  const angularCropper = this.angularCropper;
  
  const input = event.target;
  
    if (input.files && input.files[0]) {
      const reader = new FileReader();
  
      reader.onload = function (e:any) {
        angularCropper.cropper.destroy();
        angularCropper.imageUrl = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }*/
 

  clear(){
    this.angularCropper.cropper.clear();
    
  }

  reset(){
    this.angularCropper.cropper.reset();
  }

  CropMe() {
    this.flag = true;
    // this.resultResult = this.angularCropper.imageUrl;
    //console.log("Hello");
    // this.resultImage = this.angularCropper.cropper.getCroppedCanvas()
    // console.log(this.resultImage);
    this.angularCropper.exportCanvas();
    
  }

  drag(){

    this.angularCropper.cropper.setDragMode("move");
  }

  resultImageFun() {
    
   
  this.resultResult = this.angularCropper.cropper.getCroppedCanvas({
  }).toDataURL('image/jpeg');
  //console.log("ok");
  }


}

