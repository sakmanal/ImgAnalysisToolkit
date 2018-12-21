import { Component, AfterViewInit } from '@angular/core';
//import * as fabric from 'node_modules/fabric/dist/fabric';
import 'fabric';
declare const fabric: any;

//const canvas = new fabric.Canvas('c');

@Component({
  selector: 'app-test3',
  templateUrl: './test3.component.html',
  styleUrls: ['./test3.component.css']
})
export class Test3Component implements AfterViewInit {

  constructor() { }

  
   canvas:any;

ngAfterViewInit() {
    this.canvas = new fabric.Canvas('canvas', {
      selection: false
    });

    this.canvas.uniScaleTransform = true;
    this.canvas.setBackgroundImage('./assets/document1.jpg', this.canvas.renderAll.bind(this.canvas));
    const rectangle = new fabric.Rect({ 
            left: 50,
            top: 50,
            fill: 'transparent',
            stroke: '#33ccff',
            strokeWidth: 3,
            strokeDashArray: [2, 2],
            opacity: 1,
            width: 50,
            height: 50,
            borderColor: '#80dfff',
            cornerColor: '#33ccff',
            hasRotatingPoint:false,
            objectCaching: true,
            cornerSize: 6,
            transparentCorners: false,
           
            
    });
    this.canvas.add(rectangle);

    this.canvas.on('object:scaling', (e) => {
      var o = e.target;
      if (!o.strokeWidthUnscaled && o.strokeWidth) {
        o.strokeWidthUnscaled = o.strokeWidth;
      }
      if (o.strokeWidthUnscaled) {
        o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
        line.strokeWidth = 5;
      }
    })
    
    var points = [200, 50, 150, 50];
    let line = new fabric.Line(points, {
      strokeWidth: 5,
      stroke: 'red',
      cornerSize: 6,
      transparentCorners: false,
      hasRotatingPoint:false,
      //lockSkewingY:false
    });
    this.canvas.add(line);

    //line.lockUniScaling = true

    line.setControlsVisibility({
         mt: false, 
         mb: false, 
         ml: true, 
         mr: true, 
         bl: false,
         br: false, 
         tl: false, 
         tr: false,
         mtr: false,
    
  });
 
  
  } 

  rect() {

    let rectangle, isDown, origX, origY;
    this.removeEvents();
    this.canvas.on('mouse:down',  (o:any) => {
     //console.log(o.e)
     let pointer = this.canvas.getPointer(o.e);
     console.log(pointer)

     isDown = true;
     origX = pointer.x;
     origY = pointer.y;

     rectangle = new fabric.Rect({ 
      left: origX,
      top: origY,
      fill: 'transparent',
     stroke: '#ccc',
            strokeDashArray: [2, 2],
            opacity: 1,
            width: 1,
            height: 1,
            borderColor: '#36fd00',
            cornerColor: 'green',
            hasRotatingPoint:false,
            objectCaching: false
    });
    this.canvas.add(rectangle);
  });

  this.canvas.on('mouse:move',  (o:any) =>{
    if (!isDown) return;
    var pointer = this.canvas.getPointer(o.e);
    if(origX>pointer.x){
        rectangle.set({ left: Math.abs(pointer.x) });
    }
    if(origY>pointer.y){
        rectangle.set({ top: Math.abs(pointer.y) });
    }
    
    rectangle.set({ width: Math.abs(origX - pointer.x) });
    rectangle.set({ height: Math.abs(origY - pointer.y) });
    this.canvas.renderAll();
});

this.canvas.on('mouse:up',  (o:any) =>{
    isDown = false;
   // this.canvas.setActiveObject(rectangle);

    //this.canvas.selection = true;
    //this.canvas.isDrawingMode = false;
    //rectangle.selectable = true;
    this.removeEvents();
});
  

}

removeEvents(){
  this.canvas.off('mouse:down');
  this.canvas.off('mouse:up');
  this.canvas.off('mouse:move');
 }

 Line() {
   let isDown:boolean;
   let line:any;
  
  this.removeEvents();
  this.canvas.on('mouse:down', (o:any) => {
    isDown = true;
    var pointer = this.canvas.getPointer(o.e);
    var points = [pointer.x, pointer.y, pointer.x, pointer.y];
    line = new fabric.Line(points, {
      strokeWidth: 20,
      fill: 'transparent',
      stroke: '#07ff11a3',
      originX: 'center',
      originY: 'center'
    });
    this.canvas.add(line);
  });

  this.canvas.on('mouse:move', (o:any) => {
    if (!isDown) return;
    var pointer = this.canvas.getPointer(o.e);
    line.set({
      x2: pointer.x,
      y2: pointer.y
    });
    this.canvas.renderAll();
  });
  this.canvas.on('mouse:up', (o:any) => {
    isDown = false;
  });
}


info(){
  let activeObject = this.canvas.getActiveObject()
  console.log(activeObject)
}

removeRect(){
  
  let ob = this.canvas.getObjects();
  console.log(ob);

  this.canvas.remove(ob[0]);
}

setbg(){
  this.canvas.setBackgroundImage('https://www.w3schools.com/w3css/img_lights.jpg');
  //this.canvas.renderAll();


  setTimeout( () =>{ 
    this.canvas.renderAll(); }, 1000);

  
 /*  const xxx = "https://www.w3schools.com/w3css/img_lights.jpg";
   
  fabric.Image.fromURL(xxx, (oImg) => {
    this.canvas.add(oImg);
  }); */
}





}
