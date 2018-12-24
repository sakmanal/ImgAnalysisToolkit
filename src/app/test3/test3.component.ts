import { Component, AfterViewInit, Input, HostListener } from '@angular/core';
import 'fabric';

declare const fabric: any;

@Component({
  selector: 'app-test3',
  templateUrl: './test3.component.html',
  styleUrls: ['./test3.component.css']
})
export class Test3Component implements AfterViewInit {

  constructor() { }

  
  canvas:any;
  canvasWidth:number = 0;
  canvasHeight:number = 0;
  @Input() imageUrl: any;
  @Input() imageName:string;



ngAfterViewInit() {

  this.canvas = new fabric.Canvas('canvas', {
    selection: false,
    controlsAboveOverlay: false
  });
  this.loadImage();
  this.enableZoom();
  
    

   

    this.canvas.uniScaleTransform = true;
    
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
      const o = e.target;
      if (!o.strokeWidthUnscaled && o.strokeWidth) {
        o.strokeWidthUnscaled = o.strokeWidth;
      }
      if (o.strokeWidthUnscaled) {
        o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
        line.strokeWidth = 4;
      }
    })
    
    let points = [200, 50, 150, 50];
    const line = new fabric.Line(points, {
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
 
  //this.canvas.calcOffset();

  

 
} 


  loadImage(){
    let image = new Image;
    image.src = this.imageUrl;
    //img.src = './assets/document1.jpg';
   
    
    let aspectRatio = 0;
    

    image.onload = () =>{

      fabric.Image.fromURL(image.src, (img:any) => {

        const imgWidth = img.width;
        const imgHeight = img.height;

        aspectRatio = imgHeight/imgWidth;
        

         if (imgWidth > window.innerWidth-50){
          this.canvasWidth = window.innerWidth - 50;
          console.log(window.innerWidth)
        }else{
          this.canvasWidth = imgWidth;
        } 

        this.canvasHeight = this.canvasWidth * aspectRatio;
        const scaleFactor = this.canvasWidth / imgWidth;

            img.set({
                width: imgWidth, 
                height: imgHeight, 
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

  enableZoom(){
    this.canvas.on('mouse:wheel', (opt) => {
      let delta = -opt.e.deltaY;
      //var pointer = this.canvas.getPointer(opt.e);
      let zoom = this.canvas.getZoom();
      zoom = zoom + delta/300;
      if (zoom > 3) zoom = 3;
      if (zoom < 0.7) zoom = 0.7;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  
    this.canvas.on('mouse:down', (opt) => {
      let evt = opt.e;
      if (evt.altKey === true) {
        this.canvas.isDragging = true;
        //this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });
    this.canvas.on('mouse:move', (opt) => {
      if (this.canvas.isDragging) {
        let e = opt.e;
        this.canvas.viewportTransform[4] += e.clientX - this.canvas.lastPosX;
        this.canvas.viewportTransform[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
    });
    this.canvas.on('mouse:up', () => {
      this.canvas.isDragging = false;
      //this.canvas.selection = true;
      const objects = this.canvas.getObjects();
      for(let i=0; i<objects.length; i++){
        objects[i].setCoords();
      }
      
    });
  }

 ResetImageToCanvas(){
        this.canvas.viewportTransform[4] = 0;
        this.canvas.viewportTransform[5] = 0;
        this.canvas.setZoom(1);
        this.canvas.requestRenderAll();
 }

 @HostListener('window:resize', ['$event'])
 onResize(event) {
   //console.log(event.target.innerWidth);
   if (event.target.innerWidth > this.canvasWidth){
       this.canvas.setWidth(this.canvasWidth);
   }else{
       this.canvas.setWidth(event.target.innerWidth - 40);
   }
   
   
   this.canvas.calcOffset();
   
 }

  /* rect() {

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
  

}*/

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
    if (!this.canvas.getActiveObject()){
          isDown = true;
          const pointer = this.canvas.getPointer(o.e);
          const points = [pointer.x, pointer.y, pointer.x, pointer.y];
          line = new fabric.Line(points, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 4,
            stroke: 'red',
            cornerSize: 6,
            transparentCorners: false,
            hasRotatingPoint:false,
          });
          this.canvas.add(line);
    }
  });

  this.canvas.on('mouse:move', (o:any) => {
    if (!isDown) return;
    const pointer = this.canvas.getPointer(o.e);
    line.set({
      x2: pointer.x,
      y2: pointer.y,
    });
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
    this.canvas.renderAll();
  });

  this.canvas.on('mouse:up', () => {
    line.setCoords();
    isDown = false;
  });
}


info(){
  let activeObject = this.canvas.getActiveObject();
  console.log(activeObject)
}

removeRect(){
  const activeObject = this.canvas.getActiveObject();

  if (activeObject){
    this.canvas.remove(activeObject);
  }else{
    const ob = this.canvas.getObjects();
    this.canvas.remove(ob[0]);
  }
}


}
