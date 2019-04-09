import { Component, OnInit } from '@angular/core';
import 'fabric';

declare const fabric: any;

@Component({
  selector: 'app-words-segment',
  templateUrl: './words-segment.component.html',
  styleUrls: ['./words-segment.component.css']
})
export class WordsSegmentComponent implements OnInit {

  

  ngOnInit() {  
  }

  canvas:any;
  canvasWidth:number = 0;
  canvasHeight:number = 0;
  oldCanvasWidth:number;
  oldCanvasHeight:number;
  imgWidth:number;
  imgHeight:number;
  image:HTMLImageElement = new Image;
  imageUrl: string;

  firstTimeInit:boolean = true;

  ImageChange:boolean;

  xxx(){
    if (this.firstTimeInit){
      console.log("first time init");
          this.c();
          this.firstTimeInit = false;
          this.ImageChange = false;
    }else{
      if (this.ImageChange){
        console.log("image changed");
        this.b();
        this.ImageChange = false;
      }
      
    }
  }

  c(){
    this.image.onload = () =>{
        setTimeout( () => {
          this.canvas = new fabric.Canvas('canvas', {
            selection: false,
            controlsAboveOverlay: false
          });
          
          const canvas = document.createElement('canvas') as HTMLCanvasElement;     
          const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        
            this.imgWidth = this.image.width;
            this.imgHeight = this.image.height;
            canvas.width = this.image.width;
            canvas.height = this.image.height;
            ctx.drawImage(this.image, 0, 0);
            this.initCanvas();
        

        }, 50);

    };
    this.image.src = this.imageUrl;
  }

  b(){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;     
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    this.image.onload = () =>{
        this.imgWidth = this.image.width;
        this.imgHeight = this.image.height;
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);
        this.initCanvas();
    };
    this.image.src = this.imageUrl;
  }

  a(){
    setTimeout( () => {
      this.canvas = new fabric.Canvas('canvas', {
        selection: false,
        controlsAboveOverlay: false
      });
    }, 1000);
  }

  initCanvas(){
  
    this.calcCanvasDimensions();
    
    if (!this.oldCanvasWidth || !this.oldCanvasHeight ){
      this.oldCanvasWidth = this.canvasWidth;
      this.oldCanvasHeight = this.canvasHeight;
    }
    this.setBgImg();     
  }

  calcCanvasDimensions(){
      const aspectRatio = this.imgHeight/this.imgWidth;

      if (this.imgWidth > window.innerWidth-50){
        this.canvasWidth = window.innerWidth - 50;
      }else{
        this.canvasWidth = this.imgWidth;
      } 

      this.canvasHeight = this.canvasWidth * aspectRatio;
  }

  setBgImg(){
    const scaleFactor = this.canvasWidth / this.imgWidth;
    fabric.Image.fromURL(this.image.src, (img:any) => {
      img.set({
          width: this.imgWidth, 
          height: this.imgHeight, 
          originX: 'left', 
          originY: 'top',
          scaleX: scaleFactor,
          scaleY:scaleFactor
      });
      
      this.canvas.setWidth(this.canvasWidth);
      this.canvas.setHeight(this.canvasHeight);
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
    
    });
  }

}
