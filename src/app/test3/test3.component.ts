import { Component, AfterViewInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TextSelectPopUpComponent } from '../text-select-pop-up/text-select-pop-up.component';
import { SavejsonService } from '../savejson.service';
import 'fabric';

declare const fabric: any;

@Component({
  selector: 'app-test3',
  templateUrl: './test3.component.html',
  styleUrls: ['./test3.component.css']
})
export class Test3Component implements AfterViewInit {

  constructor(public dialog: MatDialog, private savejsonService: SavejsonService) {}

  
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
  cropImg:any;
  position = 'left';
  RectTool:boolean = false;
  LineTool:boolean = false;
  word:string;
  @Output() updateEvent = new EventEmitter<boolean>();

ngAfterViewInit() {
  if (this.imageUrl){

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
      
      
  }
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
        this.canvas.viewportTransform[4] = 0;
        this.canvas.viewportTransform[5] = 0;
      } 
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      
    });
  
    this.enableDrag();
}


enableDrag(){
      this.canvas.on('mouse:down', (opt:any) => {
        const evt = opt.e;
        if (evt.altKey === true) {
          //console.log("down drag")
          this.canvas.isDragging = true;
          //this.canvas.selection = false;
          this.canvas.lastPosX = evt.clientX;
          this.canvas.lastPosY = evt.clientY;
        }
      });
      this.canvas.on('mouse:move', (opt:any) => {
        if (this.canvas.isDragging) {
          //console.log("move drag")
          const e = opt.e;
          this.canvas.viewportTransform[4] += e.clientX - this.canvas.lastPosX;
          this.canvas.viewportTransform[5] += e.clientY - this.canvas.lastPosY;
          this.canvas.requestRenderAll();
          this.canvas.lastPosX = e.clientX;
          this.canvas.lastPosY = e.clientY;
        }
      });
      this.canvas.on('mouse:up', () => {
        if (this.canvas.isDragging) {
            //console.log("up drag")
            this.canvas.isDragging = false;
            //this.canvas.selection = true;
            const objects = this.canvas.getObjects();
            for(let i=0; i<objects.length; i++){
              objects[i].setCoords();
            }
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
    this.enableDrag();
    this.canvas.on('mouse:down',  (o:any) => {
      if (!this.canvas.getActiveObject()  && !this.canvas.isDragging){
          //console.log("down rect")
          const pointer = this.canvas.getPointer(o.e);
        

          isDown = true;
          origX = pointer.x;
          origY = pointer.y;

          rectangle = new fabric.Rect({ 
                  left: origX,
                  top: origY,
                  fill: 'transparent',
                  strokeDashArray: [5, 5],
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
      if (!this.canvas.getActiveObject() && isDown){
              //console.log("move rect")
              //if (!isDown) return;
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
      if (!this.canvas.getActiveObject() && isDown){
        //console.log("up rect")
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
  this.enableDrag();
  this.canvas.on('mouse:down', (o:any) => {
    if (!this.canvas.getActiveObject() && !this.canvas.isDragging){
          //console.log("down line")
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
    if (!this.canvas.getActiveObject()  && isDown){
        //console.log("move line")
        //if (!isDown) return;
        const pointer = this.canvas.getPointer(o.e);
        line.set({
          x2: pointer.x,
          y2: pointer.y
        });
        
        this.canvas.renderAll();
    }
  });

  this.canvas.on('mouse:up', () => {
    if (!this.canvas.getActiveObject() && isDown){
          //console.log("up line")
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

remove(){
  const activeObject = this.canvas.getActiveObject();

  if (activeObject){
    this.canvas.remove(activeObject);
  }else{
    const ob = this.canvas.getObjects();
    this.canvas.remove(ob[ob.length-1]);
  }
}


cropImage(){

  let activeObject = this.canvas.getActiveObject();
  if (!activeObject){
    const ob = this.canvas.getObjects();
    activeObject = ob[ob.length-1];
  }
  if (activeObject && activeObject.type == 'rect'){
    const ratio = this.image.width / this.canvasWidth;

    const x = Math.round(activeObject.left * ratio);
    const y = Math.round(activeObject.top * ratio);

    const w = Math.round(activeObject.width * ratio);
    const h = Math.round(activeObject.height * ratio);
  
 
    const canvas = document.createElement('canvas') as HTMLCanvasElement;     

    let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(this.image, -x, -y); 
    this.cropImg = canvas.toDataURL("image/png", 1);
  }
}


mergeSelection(){
  let activeObject = this.canvas.getActiveObject();
  if (!activeObject){
    const ob = this.canvas.getObjects();
    activeObject = ob[ob.length-1];
  }

  if (activeObject && activeObject.type == 'rect'){
  
    this.cropImage();
    if (this.cropImg){

      const img = new Image;
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      let yTop:number = 0;
      let yBottom:number = 0;
      let flag_yTop:boolean = true;
      let xRight:number = 0;
      let xLeft:number = 0;
      let flag_xLeft:boolean = true;

      img.onload = () =>{

        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;


        for (let i = 0; i < height; i++)
        {
          for (let k = 0; k < width; k++)
          {
              
            if ( data[4 * k + i * 4 * width] == 0 ){
                  if ( flag_yTop == true){
                    yTop= i;
                    flag_yTop = false;
                  } 
                  yBottom = height - i; 
            }
            
              
          }
        }

        for (let k = 0; k < width; k++)
        {
          for (let i = 0; i < height; i++)
          {
              
            if ( data[4 * k + i * 4 * width] == 0 ){
                  if ( flag_xLeft == true){
                    xLeft= k;
                    flag_xLeft = false;
                  } 
                  xRight = width - k; 
            }
            
              
          }
        }
      
      
        const ratioX = this.canvasWidth / this.image.width;
        const ratioY = this.canvasHeight / this.image.height;

        const x = Math.round(activeObject.left) + xLeft*ratioX;
        const y = Math.round(activeObject.top) + yTop*ratioY;
        const w = Math.round(activeObject.width) - xLeft*ratioX - xRight*ratioX ;
        const h = Math.round(activeObject.height) - yTop*ratioY - yBottom*ratioY ;  

        activeObject.left = x;
        activeObject.top = y;
        activeObject.width = w;
        activeObject.height = h;
        activeObject.scaleX = 1;
        activeObject.scaleY = 1;

        activeObject.setCoords();
        this.canvas.renderAll();
        this.canvas.calcOffset();
      }
      img.src = this.cropImg;

     
    }
  }
 
}


selectRect(){
  if (this.RectTool){
    this.LineTool = false;
    this.canvas.defaultCursor = "crosshair";
    this.rect();
  }else{
    this.removeEvents();
    this.enableDrag();
    this.canvas.defaultCursor = "default";
  }
}

selectLine(){
  if (this.LineTool){
    this.RectTool = false;
    this.canvas.defaultCursor = "crosshair";
    this.Line();
  }else{
    this.removeEvents();
    this.enableDrag();
    this.canvas.defaultCursor = "default";
  }
}

openDialog(): void {

  let activeObject = this.canvas.getActiveObject();
  if (!activeObject){
    const ob = this.canvas.getObjects();
    activeObject = ob[ob.length-1];
  }
  if (activeObject && activeObject.type == 'rect'){
    this.cropImage();
    const dialogRef = this.dialog.open(TextSelectPopUpComponent, {
      width: '500px',
      data: { CroppedImage: this.cropImg}
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
      this.word = result;
      if (this.word) {
         //console.log(this.word);
         //this.word='';
         this.savejsonService.addword(this.imageName, this.word);
         this.updateEvent.emit(true);
      }
    });
}
}

}
