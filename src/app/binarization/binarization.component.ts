import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import InvertColours from './invertColor';
import binarize from './binarize';
import { Chart } from 'chart.js';
import { WebworkerService } from '../worker/webworker.service';
import { Sauvola } from './Sauvola.worker';
import { GPP } from './gpp.worker';
import { otsu } from './otsu.worker';
import { histog } from './histogram.worker';


@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {



faSpinner = faSpinner;
url:string;
ImgUrl:string;
imageData:ImageData;
value = 138;
max = 255;
min = 0;
step = 1;
@ViewChild("canvasfilter") fcanvas;
disableImageFilter:boolean = true;
img: HTMLImageElement = new Image;
height:number;
width:number;
maxwidth:number = window.innerWidth;
ImageName:string;
showSpinner:boolean = false;
SauvolaSpinner:boolean = false;
GppSpinner:boolean = false;
colorotsu:string = "primary";
colorsauvola:string = "primary";
colornegative:string = "primary";
colorgpp:string = "primary";
@Output() updateImageEvent = new EventEmitter<object>();


//sauvola parameters
masksize:number = 8;
//stathera:number = 25; 
//rstathera:number = 512; 
stathera:number = 0.5; 
rstathera:number = 128; 
n:number = 1;

//gpp parameters
dw:number = 10;
k:number = 0.2;
R:number = 128;
q:number = 0.6;
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
  const file = event.target.files[0];
  if (file == undefined) return;
  if (!file.type.match('image')) return;

  const reader = new FileReader();
  
  reader.onload = (event:any) =>{
    
    this.url = event.target.result;
    this.disableImageFilter = false;
    this.view();
    
  };
  
  reader.readAsDataURL(event.target.files[0]);
  this.ImageName = event.target.files[0].name;
  //console.log(this.ImageName);
}

restore(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary";
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  ctx.putImageData(this.imageData, 0, 0);
  this.ImgUrl = canvas.toDataURL("image/png", 1);
  this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
}

view():void{
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
   
      this.width = this.img.width;
      this.height = this.img.height;
      this.fitscreen();
    
      const w = this.img.width;
      const h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      this.imageData = ctx.getImageData(0, 0, w, h);
      
      this.HistGraph(this.imageData);
      

      this.ImgUrl = canvas.toDataURL("image/png", 1);
      this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
      
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
  this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
}

otsuBinarization(){
  this.colorotsu = "warn";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;

      this.workerService.run(otsu, {imageData:this.imageData})
      .then( (result:any) => {
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
          this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});         
        }
      ).catch(console.error);


}


sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  this.SauvolaSpinner = true;
  
      this.workerService.run(Sauvola, {imageData:this.imageData, masksize:this.masksize, stathera:this.stathera, rstathera:this.rstathera, n:this.n})
      .then( (result:any) => {
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.SauvolaSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
          this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
        }
      ).catch(console.error);
      
  }    

manualThresholdBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary";
  this.colorgpp = "primary"; 
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      ctx.drawImage(this.img, 0, 0);

      binarize(this.value, ctx, this.img.width, this.img.height);
      this.ImgUrl = canvas.toDataURL("image/png", 1);
      this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
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
  this.GppSpinner = true;

   
      this.workerService.run(GPP, {imageData:this.imageData,  dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
      .then( (result:any) => {
          ctx.putImageData(result, 0, 0);
          this.showSpinner = false;
          this.GppSpinner = false;
          this.ImgUrl = canvas.toDataURL("image/png", 1);
          this.updateImageEvent.emit({dataURL:this.ImgUrl, name:this.ImageName});
        }
      ).catch(console.error);

}


save(){
  const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  const data = canvas.toDataURL('image/png');
  
  const a  = document.createElement('a');
  a.href = data;
  a.download = 'image.png';

  a.click()
}


HistGraph(imageData:ImageData){
  this.workerService.run(histog, {imageData:imageData})
  .then( (histArray:any) => {
         this.drawHistGraph(histArray);
    }
  ).catch(console.error);
}


myChart:any;
drawHistGraph(histArray:number[]){

  if(this.myChart) this.myChart.destroy();

  const c = []
  for (let i = 0; i < 256; i ++) {
      c.push(i);
  }

  const ctx = document.getElementById("myChart");
  this.myChart = new Chart(ctx, {
    type: 'bar',
    scaleSteps:9,
    data: {
      labels: c,
      datasets: [{
        label: 'Grey-scale Histogram',
        data: histArray,
        backgroundColor: 'rgba(255, 99, 132, 1)',
      }]
    },
    options: {
      scales: {
        xAxes: [{
          display: false,
          barPercentage: 1,
        }, {
          display: true,
        }],
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
}


 
}
