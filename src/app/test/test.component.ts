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
  //test:string = "./assets/document1.jpg";
  @ViewChild("canvasfilter") fcanvas;

  ngOnInit() {
    
    if (this.imageUrl){
      this.Jcrop.load('target').then(img => {
        this.jcp = this.Jcrop.attach(img,{multi:true});
        const rect = this.Jcrop.Rect.sizeOf(this.jcp.el);
        this.jcp.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
        this.jcp.focus();
      });

      let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
      let ctx: CanvasRenderingContext2D = canvas.getContext('2d');

      let img = new Image;
      img.onload = () =>{
      
         
         var w = 50;
         var h = 50;
         canvas.width = w;
         canvas.height = h;
         ctx.drawImage(img, 30, 30, 50, 50);
         
   
        
         
     };
     img.src = this.imageUrl;
    } 
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
    console.log(this.jcp.active.pos);}
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

}
