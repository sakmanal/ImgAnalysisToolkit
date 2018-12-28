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
  imgWidth:number;
  imgHeight:number;
  image = new Image;

ngAfterViewInit() {

  this.canvas = new fabric.Canvas('canvas', {
    selection: false,
    controlsAboveOverlay: false
  });

  
  this.image.src = this.imageUrl;
  this.image.onload = () =>{
       this.imgWidth = this.image.width;
       this.imgHeight = this.image.height;
       this.initCanvas();
  }
  
  this.enableZoom();
  
    this.canvas.uniScaleTransform = true;

    this.canvas.targetFindTolerance = 20;


     this.canvas.on("object:scaling", (e:any) => {   //or "object:modified"
      const target = e.target;
     if (target && target.type == 'line'){
         //console.log("line scale");
          return
         
      }else if (target && target.type == 'rect'){
        //console.log("rect scale")
        const sX = target.scaleX;
        const sY = target.scaleY;
        target.width *= sX;
        target.height *= sY;
        target.scaleX = 1;
        target.scaleY = 1;
      }
   
      
    }); 
    
    this.enableBoundaryLimit();



    
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

  enableBoundaryLimit(){
    this.canvas.observe("object:moving", (e:any) =>{
        const obj = e.target;
        //let bounds;
      
        /* if (obj && obj.type == 'line'){
            bounds = { w: this.canvasWidth + obj.width/2 , h: this.canvasHeight + obj.height/2,  x: obj.width/2 , y: obj.height/2};  //if originX,Y:center
        }else{
            bounds = { w: this.canvasWidth , h: this.canvasHeight,  x: 0 , y: 0};
        } */

        const bounds = { w: this.canvasWidth , h: this.canvasHeight,  x: 0 , y: 0};

        if (obj && obj.type == 'line'){
                  // left  bound
                  if (obj.left <= bounds.x){
                    obj.left = bounds.x;
                  }
              
                  // right bound
                  if( obj.left+obj.width*obj.scaleX >= bounds.w ){ 
                      obj.left = bounds.w - obj.width*obj.scaleX;
                  }
              
                  // top bound
                  if( obj.top <= bounds.y ){ 
                    obj.top = bounds.y;
                  }
              
                  // bottom bound
                  if( obj.top+obj.height*obj.scaleY >= bounds.h ){ 
                    obj.top = bounds.h - obj.height*obj.scaleY;
                  }
        }else{
                  // left  bound
                if (obj.left <= bounds.x){
                  obj.left = bounds.x;
                }
            
                // right bound
                if( obj.left+obj.width >= bounds.w ){ 
                    obj.left = bounds.w - obj.width;
                }
            
                // top bound
                if( obj.top <= bounds.y ){ 
                  obj.top = bounds.y;
                }
            
                // bottom bound
                if( obj.top+obj.height >= bounds.h ){ 
                  obj.top = bounds.h - obj.height;
                }
        }

        
        obj.setCoords();
    });
  }

  enableZoom(){
    this.canvas.on('mouse:wheel', (opt:any) => {
      const delta = -opt.e.deltaY;
      //const pointer = this.canvas.getPointer(opt.e);
      let zoom = this.canvas.getZoom();
      zoom = zoom + delta/300;
      if (zoom > 3) zoom = 3;
      if (zoom < 1){
        zoom = 1;
        this.ResetImageToCanvas();
      } 
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      
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
   
    this.calcCanvasDimensions(); 
               
    const factorX = this.canvasWidth / this.oldCanvasWidth;
    const factorY = this.canvasHeight / this.oldCanvasHeight; 
       
    this.oldCanvasWidth = this.canvasWidth;
    this.oldCanvasHeight = this.canvasHeight; 

   const objects = this.canvas.getObjects();
   for (var i in objects) {
     
    const scaleX = objects[i].scaleX;
    const scaleY = objects[i].scaleY;
    const left = objects[i].left;
    const top = objects[i].top;
    const width = objects[i].width;
    const height = objects[i].height;

    const tempScaleX = scaleX * factorX;
    const tempScaleY = scaleY * factorY;
    const tempLeft = left * factorX;
    const tempTop = top * factorY;
    const tempWidth = width * factorX;
    const tempHeight = height * factorY;

    if ( objects[i].type == 'line'){
      //console.log("line")
      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;
      //objects[i].width = tempWidth;
      //objects[i].height = tempHeight;
      //objects[i].scaleX = 1;
      //objects[i].scaleY = 1;
    }else{
      //console.log("rect")
      objects[i].left = tempLeft;
      objects[i].top = tempTop;
      objects[i].width = tempWidth;
      objects[i].height = tempHeight;
      objects[i].scaleX = 1;
      objects[i].scaleY = 1;
    }
    
    objects[i].setCoords(); 
  } 

  this.canvas.renderAll();
  this.canvas.calcOffset();
  this.setBgImg();
                                                      
 }

  rect() {

    let rectangle:any, isDown:boolean, origX:number, origY:number;
    this.removeEvents();
    this.canvas.defaultCursor = "crosshair";
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
            originX: 'left',
            originY: 'top',
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
