import { Component, HostListener, OnInit } from '@angular/core';
import {hello} from 'src/jcrop.js';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  //mouseWheelDir: string = '';
  //imgWidth: number = 400;

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    this.mouseWheelFunc(event);
  }

  img = new Image;
   //width;
   //height;
   size = {w:0,h:0};
	 pos = {x:0,y:0};
	 zoom_target = {x:0,y:0};
	 zoom_point = {x:0,y:0};
   scale = 1;
   max_scale = 4;
   factor = 0.5;
   x;
   y;

   Jcrop:any = hello();
   jcp:any;

  ngOnInit(){
    this.img.onload = () =>{
      
      //this.width = this.img.width;
      //this.height = this.img.height;
      //this.size.w = 900;
      //this.size.h = 500;   
  };
  this.img.src = "../assets/document1.jpg";
  //this.img.src = "https://iso.500px.com/wp-content/uploads/2014/07/big-one.jpg";

  var target = document.getElementById("slide");
  this.size.w = target.offsetWidth;
  this.size.h = target.offsetHeight;
  console.log(this.size);

  this.scale = 2;


  if (this.img.src){
    this.Jcrop.load('g').then(img => {
      this.jcp = this.Jcrop.attach(img,{multi:true});
      this.jcp.focus();
    });
  }

  }

  mouseWheelFunc(event: any) {
    var el = document.getElementById("container");
    var domRect = el.getBoundingClientRect();
    this.zoom_point.x = event.clientX - domRect.left;
    this.zoom_point.y = event.clientY - domRect.top;
    
    if (this.zoom_point.x>this.size.w) {this.zoom_point.x = this.size.w}
    if (this.zoom_point.y>this.size.h) {this.zoom_point.y = this.size.h}

    
    if (this.zoom_point.y<0) {this.zoom_point.y = 0}
    //console.log(this.zoom_point);

    var event = window.event || event; // old IE support
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if(event.preventDefault) {
        event.preventDefault();}

    //console.log('mouse wheel up');
     // determine the point on where the slide is zoomed in
     this.zoom_target.x = (this.zoom_point.x - this.pos.x)/this.scale;
     this.zoom_target.y = (this.zoom_point.y - this.pos.y)/this.scale;

     // apply zoom
     this.scale += delta*this.factor * this.scale;
     this.scale = Math.max(1,Math.min(this.max_scale,this.scale));

     // calculate x and y based on zoom
     this.pos.x = -this.zoom_target.x * this.scale + this.zoom_point.x;
     this. pos.y = -this.zoom_target.y * this.scale + this.zoom_point.y;

     
     // Make sure the slide stays in its container area when zooming out
     if(this.pos.x>0)
     {this.pos.x = 0}
     if(this.pos.x+this.size.w*this.scale<this.size.w)
     {this.pos.x = -this.size.w*(this.scale-1)}
     if(this.pos.y>0)
     {this.pos.y = 0}
      if(this.pos.y+this.size.h*this.scale<this.size.h)
      {this.pos.y = -this.size.h*(this.scale-1)}


     this.x =  this.pos.x + this.size.w*(this.scale-1)/2;
     this.y = this.pos.y + this.size.h*(this.scale-1)/2;


    //console.log(this.pos.x, this.pos.y, this.scale)

    /*var event = window.event || event; // old IE support
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

   var el = document.getElementById("g");

   var Iw = el.offsetWidth;
   
   this.scale = 1;
   console.log(Iw);*/




  }

}
