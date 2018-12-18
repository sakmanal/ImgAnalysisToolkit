import { Component, ViewChild } from '@angular/core';
import otsuMethod from './otsu.module';
import sauvolaMethod from './sauvola.module';
import InvertColours from './invertColor.module';
import binarize from './binarize.module';
import gppMethod from './gpp.module';
import { faCompress, faExpand, faSpinner } from '@fortawesome/free-solid-svg-icons';


const SauvolaWorker = new Worker('src/web-workers-scripts/Sauvola-worker.js');

@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {

//faExpand = faExpand;
//faCompress = faCompress;
faSpinner = faSpinner;
imageToCrop:any = '';
url:any;
ImgUrl:any;
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
panelOpenState = false;

//sauvola parameters
masksize:number = 8;
stathera:number = 25;
rstathera:number = 512;
n:number = 1;

//gpp parameters
dw:number = 10;
k:number = 2.0;
R:number = 128;
q:number = 1.7;
p1:number = 0.5;
p2:number = 0.7;
upsampling:boolean = true;
dw1:number = 20;


/* zoomIN(){
  if (this.width < window.innerWidth) {this.width += 30};
}

zoomOUT(){
   if (this.width>window.innerWidth){this.width = window.innerWidth; }
   this.width -= 30;
}*/

fillscreen(){
  var width = document.getElementById('main').offsetWidth;
  this.width = width;
  //this.width = window.innerWidth;
} 

/* originalSize(){

   this.width = this.img.width;
} */

fitscreen(){
  var width = document.getElementById('main').offsetWidth;
   var r = this.img.width / this.img.height;
   var w  = window.innerWidth / (window.innerHeight-190);
   if (w > r)
   {
       this.width = this.img.width * (window.innerHeight-190)/this.img.height;
       
   }
   else
   {
       //this.width = window.innerWidth;
       
       this.width = width;
   }
}


mouseWheelUpFunc() {
  //console.log('mouse wheel up');
  var width = document.getElementById('main').offsetWidth;
  //console.log(width)
  if (this.width <= width) 
      this.width = this.width + 100;
}

mouseWheelDownFunc() {
  //console.log('mouse wheel down');
   if (this.width >= 300) 
       this.width = this.width - 100;
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

/* sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     

      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      setTimeout(() => {
        sauvolaMethod(ctx, w, h, this.masksize, this.stathera, this.rstathera, this.n);
        this.showSpinner = false;
        this.ImgUrl = canvas.toDataURL("image/png", 1);
      }, 1000);
     
      
    };
    this.img.src = this.url;
    
} */


sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     

      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, w, h);
      SauvolaWorker.postMessage({imageData, masksize:this.masksize, stathera:this.stathera, rstathera:this.rstathera, n:this.n}, [imageData.data.buffer]);
     


      SauvolaWorker.addEventListener('message', (d) => {
        const imageData = d.data;
        ctx.putImageData(imageData, 0, 0);
        this.showSpinner = false;
        this.ImgUrl = canvas.toDataURL("image/png", 1);
      });

      
      
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
     

      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      gppMethod(ctx, w, h, this.dw, this.k, this.R, this.q, this.p1, this.p2, this.upsampling, this.dw1);
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
