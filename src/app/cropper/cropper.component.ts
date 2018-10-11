import { Component, ViewChild } from '@angular/core';
import { AngularCropperjsComponent, ImageCropperResult } from 'angular-cropperjs';

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.css']
})
export class CropperComponent  {


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
    dragMode:'crop'      //'crop': create a new crop box, 'move': move the canvas, 'none': do nothing
    
  };
  imageUrl = "https://thewindowsclub-thewindowsclubco.netdna-ssl.com/wp-content/uploads/2015/11/hide-text-in-Word-sample-document.png";
  resultImage: any;
  resultResult: any;
  flag=true;
 


 onFileAdded(event){
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
  }
 

  clear(){
    this.angularCropper.cropper.clear();
  }

  CropMe() {
    this.flag = true;
    // this.resultResult = this.angularCropper.imageUrl;
    console.log("Hello");
    // this.resultImage = this.angularCropper.cropper.getCroppedCanvas()
    // console.log(this.resultImage);
    this.angularCropper.exportCanvas();

  }

  resultImageFun() {
    
   
  this.resultResult = this.angularCropper.cropper.getCroppedCanvas({
  }).toDataURL('image/jpeg');
  console.log("ok");
  }


}

