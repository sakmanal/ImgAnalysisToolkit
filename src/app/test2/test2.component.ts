import { Component, OnInit } from '@angular/core';
import Jcrop from 'jcrop';

//declare var Jcrop:any;

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

   //@ViewChild("target") target;

  constructor() { }
 jcp;
  ngOnInit() {

    Jcrop.load('target').then(img => {
      this.jcp = Jcrop.attach(img,{multi:true}); 
    }); 
     
  }


  enable(){
    if (!this.jcp){
    Jcrop.load('target').then(img => {
      this.jcp = Jcrop.attach(img,{multi:true}); 
    }); 
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
        const rect = Jcrop.Rect.create(0,0,50,50);
         const options = {};
         this.jcp.newWidget(rect,options);}
   }

   remove(){
     if (this.jcp){
        this.jcp.removeWidget(this.jcp.active);}
   }

}
