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
  oldCanvasWidth:number;
  oldCanvasHeight:number;
  //imgWidth;
  //imgHeight;


ngAfterViewInit() {

  this.canvas = new fabric.Canvas('canvas', {
    selection: false,
    controlsAboveOverlay: false
  });
  this.loadImage();
  this.enableZoom();
  
  

   

    this.canvas.uniScaleTransform = true;

    
     this.canvas.targetFindTolerance = 20;


     this.canvas.on("object:scaling", (e:any) => {   //or modified
      const target = e.target;
      /* if (target && target.type == 'line'){
        const sX = target.scaleX;
        const sY = target.scaleY;
        target.width *= sX;
          target.height *= sY;
          target.scaleX = 1;
          target.scaleY = 1;
      } */
      if (!target || target.type !== 'rect') {
          return;
      }
      const sX = target.scaleX;
      const sY = target.scaleY;
      target.width *= sX;
      target.height *= sY;
      target.scaleX = 1;
      target.scaleY = 1;
    });
    
    /* const rectangle = new fabric.Rect({ 
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
    this.canvas.add(rectangle); */

   /*  this.canvas.on('object:scaling', (e) => {
      const o = e.target;
      if (!o.strokeWidthUnscaled && o.strokeWidth) {
        o.strokeWidthUnscaled = o.strokeWidth;
      }
      if (o.strokeWidthUnscaled) {
        o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
        //o.strokeWidth = 3;
      }
    }) */
    
    /* let points = [200, 50, 150, 50];
    const line = new fabric.Line(points, {
      strokeWidth: 3,
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
    
  }); */
 
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

        //this.imgWidth = imgWidth;
        //this.imgHeight = imgHeight;

        aspectRatio = imgHeight/imgWidth;
        

         if (imgWidth > window.innerWidth-50){
          this.canvasWidth = window.innerWidth - 50;
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
            console.log(this.canvasWidth, this.canvasHeight);
            if (!this.oldCanvasWidth || !this.oldCanvasHeight ){
              this.oldCanvasWidth = this.canvasWidth;
              this.oldCanvasHeight = this.canvasHeight;
              console.log("only 1s time:", this.oldCanvasWidth, this.oldCanvasHeight)
             }
            this.canvas.setWidth(this.canvasWidth);
            this.canvas.setHeight(this.canvasHeight);
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
           //this.canvas.calcOffset();
      });
   }
  }

  enableZoom(){
    this.canvas.on('mouse:wheel', (opt:any) => {
      const delta = -opt.e.deltaY;
      //var pointer = this.canvas.getPointer(opt.e);
      let zoom = this.canvas.getZoom();
      zoom = zoom + delta/300;
      if (zoom > 3) zoom = 3;
      if (zoom < 1) zoom = 1;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
  
     /*    if (this.canvas.viewportTransform[4] >= 0) {
          this.canvas.viewportTransform[4] = 0;
        } else if (this.canvas.viewportTransform[4] < this.canvas.getWidth() - 1000 * zoom) {
          this.canvas.viewportTransform[4] = this.canvas.getWidth() - 1000 * zoom;
        }
        if (this.canvas.viewportTransform[5] >= 0) {
          this.canvas.viewportTransform[5] = 0;
        } else if (this.canvas.viewportTransform[5] < this.canvas.getHeight() - 1000 * zoom) {
          this.canvas.viewportTransform[5] = this.canvas.getHeight() - 1000 * zoom;
        } */
      
    });
  
    this.canvas.on('mouse:down', (opt:any) => {
      const evt = opt.e;
      if (evt.altKey === true) {
        this.canvas.isDragging = true;
        //this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });
    this.canvas.on('mouse:move', (opt:any) => {
      if (this.canvas.isDragging) {
        const e = opt.e;
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
 onResize(event:any) {
   //console.log(event.target.innerWidth);
   /* setTimeout( () => {
                }, 100); */ 
  /*  if (event.target.innerWidth > this.canvasWidth){
       this.canvas.setWidth(this.canvasWidth);
   }else{
       this.canvas.setWidth(event.target.innerWidth - 40);
   } */
  
   this.loadImage();
   
    setTimeout( () => {
               
   const factorX = this.canvasWidth / this.oldCanvasWidth;
   const factorY = this.canvasHeight / this.oldCanvasHeight; 
         if (factorX == 1){console.log("error:", factorX, this.canvasWidth, this.oldCanvasWidth)}
        //window.alert(factorX)
    this.oldCanvasWidth = this.canvasWidth;
    this.oldCanvasHeight = this.canvasHeight; 

   const objects = this.canvas.getObjects();
   for (var i in objects) {
     
    var scaleX = objects[i].scaleX;
    var scaleY = objects[i].scaleY;
    var left = objects[i].left;
    var top = objects[i].top;

    var tempScaleX = scaleX * factorX;
    var tempScaleY = scaleY * factorY;
    var tempLeft = left * factorX;
    var tempTop = top * factorY;

    objects[i].scaleX = tempScaleX;
    objects[i].scaleY = tempScaleY;
    objects[i].left = tempLeft;
    objects[i].top = tempTop;

    objects[i].setCoords();
  } 

  this.canvas.renderAll();
   this.canvas.calcOffset();
  }, 500); 
 }

  rect() {

    let rectangle:any, isDown:boolean, origX:number, origY:number;
    this.removeEvents();
    this.canvas.on('mouse:down',  (o:any) => {
      if (!this.canvas.getActiveObject()){
          const pointer = this.canvas.getPointer(o.e);
        

          isDown = true;
          origX = pointer.x;
          origY = pointer.y;

          rectangle = new fabric.Rect({ 
                  left: origX,
                  top: origY,
                  fill: 'transparent',
                  strokeDashArray: [10, 5],
                  strokeLineCap: 'square',
                  opacity: 1,
                  width: 1,
                  height: 1,
                  borderColor: '#80dfff',
                  cornerColor: '33ccff',
                  hasRotatingPoint:false,
                  objectCaching: false,
                  stroke: '#33ccff',
                  strokeWidth: 2,
                  transparentCorners: false,
                  cornerSize: 6,
          });
          this.canvas.add(rectangle);
     }
  });

  this.canvas.on('mouse:move',  (o:any) =>{
    if (!this.canvas.getActiveObject()){
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
    }
});

this.canvas.on('mouse:up',  () =>{
  if (!this.canvas.getActiveObject()){
    isDown = false;
    //rectangle.setCoords();
    if (rectangle.width<10 ) {rectangle.width = 20;  this.canvas.renderAll();}
    if (rectangle.height<10) {rectangle.height = 20; this.canvas.renderAll();}
    rectangle.setCoords();
  }
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
    if (!this.canvas.getActiveObject()){
          //console.log(o.e.altKey)
          //this.canvas.selection = false;
          isDown = true;
          const pointer = this.canvas.getPointer(o.e);
          const points = [pointer.x, pointer.y, pointer.x, pointer.y];
          line = new fabric.Line(points, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 3,
            stroke: 'red',
            cornerSize: 6,
            transparentCorners: false,
            hasRotatingPoint:false
          });
          this.canvas.add(line);
    }
  });

  this.canvas.on('mouse:move', (o:any) => {
    if (!this.canvas.getActiveObject()){
        if (!isDown) return;
        const pointer = this.canvas.getPointer(o.e);
        line.set({
          x2: pointer.x,
          y2: pointer.y
        });
        
        this.canvas.renderAll();
    }
  });

  this.canvas.on('mouse:up', () => {
    if (!this.canvas.getActiveObject()){
          isDown = false;
          line.setCoords();
          const width = Math.round(line.width);
          const height = Math.round(line.height);
          const length = Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) );
          //console.log(length)
          if (length < 15){
            line.set({
              x2: line.x2 + 20,
              y2: line.y1 
            });
          
            this.canvas.renderAll();  
          }
          line.setControlsVisibility({
            mt: false, 
            mb: false, 
            ml: true, 
            mr: true, 
            bl: false,
            br: false, 
            tl: false, 
            tr: false,
            mtr: false
          });
          line.setCoords();
          //this.canvas.selection = true;
     }
  });

/*   this.canvas.on('object:scaling', (e:any) => {
    const o = e.target;
    o.strokeWidth = 3;
  }); */
}


info(){
  const activeObject = this.canvas.getActiveObject();

  if (activeObject){
    console.log(Math.round(activeObject.left), Math.round(activeObject.top), Math.round(activeObject.width), Math.round(activeObject.height) );
  }else{
    const ob = this.canvas.getObjects();
    console.log(ob[ob.length-1]);
  }
}

removeRect(){
  const activeObject = this.canvas.getActiveObject();

  if (activeObject){
    this.canvas.remove(activeObject);
  }else{
    const ob = this.canvas.getObjects();
    this.canvas.remove(ob[ob.length-1]);
  }
}


}
