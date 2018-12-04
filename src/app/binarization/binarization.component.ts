import { Component, ViewChild } from '@angular/core';
import otsuMethod from './otsu.module';
import sauvolaMethod from './sauvola.module';
import InvertColours from './invertColor.module';
import binarize from './binarize.module';
import gppMethod from './gpp.module';


@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {



imageToCrop:any = '';
otsuFilter:boolean = false;
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
img: HTMLImageElement = new Image;
height:any;
width:number;
maxwidth:number = window.innerWidth;
flag:boolean;
ImageName:string;
showSpinner:boolean = false;
colorotsu:string = "primary";
colorsauvola:string = "primary";
colornegative:string = "primary";
colorgpp:string = "primary";

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
   var r = this.img.width / this.img.height;
   var w  = window.innerWidth / (window.innerHeight-250);
   if (w > r)
   {
       this.width = this.img.width * (window.innerHeight-250)/this.img.height;
       
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
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     if (this.flag){
         this.flag = false;
         this.width = this.img.width;
         this.height = this.img.height;
         this.fitscreen();
     } 
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      

      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  this.img.src = this.url;



  
}

InvertColoursFilter(){

  
  var precolor = this.colornegative;
  if (precolor == "primary"){this.colornegative = "warn";}else{this.colornegative = "primary"}

  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
   
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

       InvertColours(ctx, w, h);
       
      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  this.img.src = this.ImgUrl;
}

otsuBinarization(){
  this.colorotsu = "warn";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      otsuMethod(ctx, w, h);

      this.ImgUrl = canvas.toDataURL("image/png", 1);
    };
    this.img.src = this.url;
}

sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      setTimeout(() => {
        sauvolaMethod(ctx, w, h);
        this.showSpinner = false;
        this.ImgUrl = canvas.toDataURL("image/png", 1);
      }, 1000);
     
      
    };
    this.img.src = this.url;
    
}

manualThresholdBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      binarize(this.value, ctx, w, h);
      this.ImgUrl = canvas.toDataURL("image/png", 1);
    };
    this.img.src = this.url;

}

gppdBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "warn"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      gppMethod(ctx, w, h);
      this.ImgUrl = canvas.toDataURL("image/png", 1);
    };
    this.img.src = this.url;

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
