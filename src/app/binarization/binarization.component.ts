import { Component, ViewChild } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import InvertColours from './invertColor.module';
import binarize from './binarize.module';

import { WebworkerService } from '../worker/webworker.service';
import { Sauvola } from './Sauvola.script';
import { GPP } from './gpp.script';
import { otsu } from './otsu.script';


@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {



faSpinner = faSpinner;
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


constructor(private workerService: WebworkerService){}


fillscreen(){
  const width = document.getElementById('main').offsetWidth;
  this.width = width;
} 



fitscreen(){
  const width = document.getElementById('main').offsetWidth;
   const r = this.img.width / this.img.height;
   const w  = window.innerWidth / (window.innerHeight-190);
   if (w > r)
   {
       this.width = this.img.width * (window.innerHeight-190)/this.img.height;      
   }
   else
   {   
       this.width = width;
   }
}


mouseWheelUpFunc() {
  //console.log('mouse wheel up');
  const width = document.getElementById('main').offsetWidth;
  if (this.width <= width) 
      this.width = this.width + 100;
}

mouseWheelDownFunc() {
  //console.log('mouse wheel down');
   if (this.width >= 300) 
       this.width = this.width - 100;
}

onSelectFile(event:any):void { // called each time file input changes
  const reader = new FileReader();
  
  reader.onload = (event:any) =>{
    
    
    this.flag = true;
    this.url = event.target.result;
    this.disableImageFilter = false;
    this.view();
    
    
  };
  
  reader.readAsDataURL(event.target.files[0]);
  this.ImageName = event.target.files[0].name;
  //console.log(this.ImageName);
}

view():void{
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     if (this.flag){
         this.flag = false;
         this.width = this.img.width;
         this.height = this.img.height;
         this.fitscreen();
     } 

      const w = this.img.width;
      const h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      

      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  this.img.src = this.url;



  
}

InvertColoursFilter(){

  
  const precolor = this.colornegative;
  if (precolor == "primary"){this.colornegative = "warn";}else{this.colornegative = "primary"}

  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  InvertColours(ctx, this.img.width, this.img.height);
  this.ImgUrl = canvas.toDataURL("image/png", 1);
}

otsuBinarization(){
  this.colorotsu = "warn";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     

      const w = this.img.width;
      const h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      const imageData = ctx.getImageData(0, 0, w, h);

      this.workerService.run(otsu, {imageData})
      .then( (result:any) => {
          //console.log(result);
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
        }
      ).catch(console.error);

      
    };
    this.img.src = this.url;
}





sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     

      const w = this.img.width;
      const h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, w, h);

      this.workerService.run(Sauvola, {imageData, masksize:this.masksize, stathera:this.stathera, rstathera:this.rstathera, n:this.n})
      .then( (result:any) => {
          //console.log(result);
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
        }
      ).catch(console.error);
      
      
    };
    this.img.src = this.url; 
   
  }    

manualThresholdBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     

      const w = this.img.width;
      const h = this.img.height;
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
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     

      const w = this.img.width;
      const h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      this.workerService.run(GPP, {imageData,  dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
      .then( (result:any) => {
          //console.log(result);
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
        }
      ).catch(console.error);
    };
    this.img.src = this.url;

}


save(){
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const data = canvas.toDataURL('image/png');
  
  const a  = document.createElement('a');
  a.href = data;
  a.download = 'image.png';

  a.click()
}


 
}
