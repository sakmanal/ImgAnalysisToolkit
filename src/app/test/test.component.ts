import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {hello} from 'src/jcrop.js';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor() { }

  
  @Input() imageUrl: any;
  @Input() imageName:string;
  Jcrop:any = hello();
  jcp:any;
  width:number;
  maxwidth:number = window.innerWidth;
  //@ViewChild("canvasfilter") fcanvas;     //no need when using offscreen canvas!!
  originalWidth:number;
  cropImg:any;
 

  ngOnInit() {
    
    if (this.imageUrl){
      this.Jcrop.load('target').then(img => {
        this.jcp = this.Jcrop.attach(img,{multi:true});
        //const rect = this.Jcrop.Rect.sizeOf(this.jcp.el);
        //this.jcp.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
        this.jcp.focus();
      });

      let img = new Image;
      img.onload = () =>{
         this.width = img.width;
         this.originalWidth = img.width;
      
      };
       img.src = this.imageUrl;
      
     
    } 
  }
 

  cropImage(){
    const displayedImage = document.getElementById('target');       
    const ratio = this.originalWidth / displayedImage.offsetWidth;

    var pos = this.jcp.active.pos;
    const x = Math.round(pos.x * ratio);
    const y = Math.round(pos.y * ratio);

    const w = Math.round(pos.w * ratio);
    const h = Math.round(pos.h * ratio);


    //let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;              //with canvas
    const canvas = document.createElement('canvas') as HTMLCanvasElement;     //with offscreen canvas

    let ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    let img = new Image;           

    img.onload = () =>{        //Also working without img.onload()!!
    
      
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, -x, -y); 
      this.cropImg = canvas.toDataURL("image/png", 1);
  };
  img.src = this.imageUrl; 


  }

  opacity(value:boolean){
    
    this.jcp.setOptions({shade: value});
  }

  xxx(value){
         
    if (!this.jcp){
        console.log("error");
        }else{
    this.jcp.setOptions({shadeOpacity:value});}
  }

 
  log(){
    if (!this.jcp){
        console.log("error");
        }else{
    console.log(this.jcp.active.pos);
    var tmp = this.jcp.active.pos;
    console.log(tmp.x);

   }
  }
    
  rect(){
    if (this.jcp){
        const rect = this.Jcrop.Rect.create(0,0,50,50);
         const options = {};
         this.jcp.newWidget(rect,options);}
   }

   remove(){
     if (this.jcp){
        this.jcp.removeWidget(this.jcp.active);}
   }


   mouseWheelUpFunc() {
    //console.log('mouse wheel up');
    if (this.width <= window.innerWidth) 
        this.width = this.width + 100;
  }

  mouseWheelDownFunc() {
    //console.log('mouse wheel down');
     if (this.width >= 300) 
         this.width = this.width - 100;
  }

 




}
