import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {



imageToCrop:any = '';
checked:boolean = false;
checked2:boolean = false;
url:any;
ImgUrl:any;
x3:number;
y3:number;
value = 138;
max = 255;
min = 0;
step = 1;
@ViewChild("canvasfilter") fcanvas;
disableImageFilter:boolean = true;
imagedata:any;
height:any;
width:number;
maxwidth:number = window.innerWidth;
flag:boolean;
ImageName:string;


zoomIN(){
  if (this.width < window.innerWidth) {this.width += 30};
}

zoomOUT(){
   if (this.width>window.innerWidth){this.width = window.innerWidth; }
   this.width -= 30;
}

fillscreen(){
  this.width = window.innerWidth;
}

originalSize(){

   this.width = this.x3;
}

fitscreen(){
   var r = this.x3 / this.y3;
   var w  = window.innerWidth / (window.innerHeight-300);
   if (w > r)
   {
       this.width = this.x3 * (window.innerHeight-300)/this.y3;
       
   }
   else
   {
       this.width = window.innerWidth;
   }
}

onSelectFile(event:any):void { // called each time file input changes
  var reader = new FileReader();
  
  reader.onload = (event:any) =>{
    
    
    this.flag = true;
    this.url = event.target.result;
    //this.imagedata =  event.target.result;
    this.disableImageFilter = false;
    this.view();
    
    
  };
  
  reader.readAsDataURL(event.target.files[0]);
  this.ImageName = event.target.files[0].name;
  console.log(this.ImageName);
}


view():void{
    
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  let image = new Image();
  
  image.onload = () =>{
     if (this.flag){
         this.flag = false;
         this.width = image.width;
         this.height = image.height;
     } 
      this.x3 = image.width;
      this.y3 = image.height;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      var pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (this.checked){
          for(var i = 0; i < pixelData.data.length; i += 4) {

          
              //Black and White Conversion
              // Get the weighted "average" of r, g, and b
              var bw = 0.2 * pixelData.data[i] +  0.72 * pixelData.data[i + 1] + 0.07 * pixelData.data[i + 2];
             
              // Set r, g, and b to the calculated "average"
              pixelData.data[i]     = bw; // r
              pixelData.data[i + 1] = bw; // g
              pixelData.data[i + 2] = bw; // b  
              
              
             if (pixelData.data[i]>this.value){pixelData.data[i]=255;}else{pixelData.data[i]=0;}
             if (pixelData.data[i+1]>this.value){pixelData.data[i+1]=255;}else{pixelData.data[i+1]=0;}
             if (pixelData.data[i+2]>this.value){pixelData.data[i+2]=255;}else{pixelData.data[i+2]=0;}
          }



      }

      if (this.checked2){
          for(var i = 0; i < pixelData.data.length; i += 4) {
          //Invert Colours
          // Subtract each component from 255
          pixelData.data[i ]    = 255 - pixelData.data[i];     // r
          pixelData.data[i + 1] = 255 - pixelData.data[i + 1]; // g
          pixelData.data[i + 2] = 255 - pixelData.data[i + 2]; // b
          }
          
          }
      ctx.putImageData(pixelData, 0, 0);
      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  image.src = this.url;



  
}


save(){
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  var data = canvas.toDataURL('image/png');
  
  var a  = document.createElement('a');
  a.href = data;
  a.download = 'image.png';

  a.click()
}
  
}
