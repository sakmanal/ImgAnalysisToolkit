import { Component, HostListener, Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { SavejsonService } from '../savejson.service';
import { WebworkerService } from '../worker/webworker.service';
import { GPP } from '../binarization/gpp.worker';
import { GetSegments } from '../Segmentation/MyARLSA.worker';
import { faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import 'fabric';
import { IsBinary } from '../Segmentation/IsBinary';
import {MatSnackBar} from '@angular/material';
import {WordSnackBarComponent} from '../word-snack-bar/word-snack-bar.component';

interface blobObject{
  Array:boolean[][];
  x:number;
  y:number;
  height:number;
  width:number;
  Right:number;
  Bottom:number;
  Density:number;
  Elongation:number;
}

interface TextSegments{
  x:number;
  y:number;
  width:number;
  height:number;
  word:string;
}

declare const fabric: any;

@Component({
  selector: 'app-words-segment',
  templateUrl: './words-segment.component.html',
  styleUrls: ['./words-segment.component.css']
})
export class WordsSegmentComponent {

 
  constructor(private savejsonService: SavejsonService, private workerService: WebworkerService, public snackBar: MatSnackBar) {}

  faInfoCircle = faInfoCircle;
  canvas:any;
  canvasWidth:number = 0;
  canvasHeight:number = 0;
  imageUrl: string;
  imageName:string;
  oldCanvasWidth:number;
  oldCanvasHeight:number;
  imgWidth:number;
  imgHeight:number;
  image = new Image;
  cropImg:string;
  RectTool:boolean = false;
  LineTool:boolean = false;
  left:number;
  top:number;
  width:number;
  showTextInput:boolean = false;
  @Output() updateEvent = new EventEmitter<boolean>();
  Binary:boolean = false;
  imagedata:ImageData;
  faSpinner = faSpinner;
  Segmloader:boolean  = false;
  firstTimeInit:boolean = true;
  ImageChange:boolean;
  expandFullScreen:boolean = false;
  @ViewChild("inputField") inputField: ElementRef;
  blobId:number = 0;
  words:string[] = [];
  id:number;

  //gpp parameters
  dw:number = 10;
  k:number = 2.0;
  R:number = 128;
  q:number = 1.7;
  p1:number = 0.5;
  p2:number = 0.7;
  upsampling:boolean = true;
  dw1:number = 20;

  //ARLSA parameters
  ARLSA_a:number = 1;
  ARLSA_c:number = 0.7;
  ARLSA_Th:number = 3.5;
  RemovePunctuationMarks:boolean = true;

 

  handleComponentView(){
    if (this.firstTimeInit){
          //console.log("first time init");
          this.initFabric();
          this.firstTimeInit = false;
          this.ImageChange = false;
    }else{
      if (this.ImageChange){
        //console.log("image changed");
        this.cancel();
        this.removeAllObjects();
        this.words = [];
        this.changeImage();
        this.ImageChange = false;
      }
      
    }
  }

  initFabric(){
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
          this.imagedata = ctx.getImageData(0, 0, this.image.width, this.image.height);
          this.IsBinaryImage();
          this.initCanvas();
          this.enableZoom();   
          this.canvas.uniScaleTransform = true;
          this.canvas.targetFindTolerance = 20;
          this.EnableObjectsScaling();
          this.enableBoundaryLimit();      

        }, 50);

    };
    this.image.src = this.imageUrl;
  }

  changeImage(){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;     
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    this.image.onload = () =>{
        this.imgWidth = this.image.width;
        this.imgHeight = this.image.height;
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);
        this.imagedata = ctx.getImageData(0, 0, this.image.width, this.image.height);
        this.IsBinaryImage();
        this.oldCanvasWidth = undefined;
        this.oldCanvasHeight = undefined;
        this.initCanvas();
        
    };
    this.image.src = this.imageUrl;   
  }


  IsBinaryImage(){
    this.workerService.run(IsBinary, this.imagedata)
          .then( (result:any) => {
              this.Binary = result;        
            }
          ).catch(console.error);
  }
  
  EnableObjectsScaling(){
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
        this.CalcTextInputCords(target.left, target.top, target.width);
      }
  
      
    }); 
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
    if (this.expandFullScreen){
      this.canvasWidth = window.innerWidth - 50;
    }else{
      if (this.imgWidth > window.innerWidth-50){
          this.canvasWidth = window.innerWidth - 50;
      }else{
          this.canvasWidth = this.imgWidth;
      } 
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

  expandCanvas(){
    this.cancel();
    this.oldCanvasWidth = undefined;
    this.oldCanvasHeight = undefined;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    this.initCanvas();
    const factorX = this.canvasWidth / w;
    const factorY = this.canvasHeight / h;
  
     const objects = this.canvas.getObjects();
      for (const i in objects) {
        
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
          objects[i].scaleX = tempScaleX;
          objects[i].scaleY = tempScaleY;
          objects[i].left = tempLeft;
          objects[i].top = tempTop;
        }else{
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
   
  }
  
  enableBoundaryLimit(){
      this.canvas.observe("object:moving", (e:any) =>{
          const obj = e.target;
   
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
  
                  this.CalcTextInputCords(obj.oCoords.tl.x, obj.oCoords.tl.y, obj.oCoords.tr.x - obj.oCoords.tl.x + 1); //update TextInput div Cords on object moving
          }
  
          
          obj.setCoords();
      });
  }
  
  enableZoom(){
      this.canvas.on('mouse:wheel', (opt:any) => {
        const delta = -opt.e.deltaY;
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
  
            const activeObject = this.canvas.getActiveObject();
            
            if (activeObject && activeObject.type == 'rect'){
            
              this.CalcTextInputCords(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, activeObject.oCoords.tr.x - activeObject.oCoords.tl.x + 1);
            }
        
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
            this.cancel();
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
     if (this.canvas){
      this.cancel();
      this.calcCanvasDimensions(); 
                 
      const factorX = this.canvasWidth / this.oldCanvasWidth;
      const factorY = this.canvasHeight / this.oldCanvasHeight; 
         
      this.oldCanvasWidth = this.canvasWidth;
      this.oldCanvasHeight = this.canvasHeight; 
  
     const objects = this.canvas.getObjects();
      for (const i in objects) {
        
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
          objects[i].scaleX = tempScaleX;
          objects[i].scaleY = tempScaleY;
          objects[i].left = tempLeft;
          objects[i].top = tempTop;
        }else{
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
   }
  
  rect() {
  
      let rectangle:any, isDown:boolean, origX:number, origY:number;
      this.removeEvents();
      this.enableDrag();
      this.canvas.on('mouse:down',  (o:any) => {
        if (!this.canvas.getActiveObject()  && !this.canvas.isDragging){
  
            this.cancel();
            //console.log("down rect")
            const pointer = this.canvas.getPointer(o.e);
          
  
            isDown = true;
            origX = pointer.x;
            origY = pointer.y;
  
            rectangle = new fabric.Rect({ 
                    left: origX,
                    top: origY,
                    fill: 'transparent',
                    /* strokeDashArray: [5, 5],
                    strokeLineCap: 'square', */
                    opacity: 1,
                    width: 1,
                    height: 1,
                    borderColor: '#00b300',
                    cornerColor: '#004d00',
                    hasRotatingPoint:false,
                    objectCaching: false,
                    stroke: '#00b300',
                    strokeWidth: 1,
                    transparentCorners: false,
                    cornerSize: 6,
                    id: this.blobId++
            });
            this.canvas.add(rectangle);
       }
    });
  
      this.canvas.on('mouse:move',  (o:any) =>{
        if (!this.canvas.getActiveObject() && isDown){
                //console.log("move rect")
                //if (!isDown) return;
                const pointer = this.canvas.getPointer(o.e);
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
          if (rectangle.width<5 ) {rectangle.width = 10;  this.canvas.renderAll();}
          if (rectangle.height<5) {rectangle.height = 10; this.canvas.renderAll();}
          rectangle.setCoords();
          this.canvas.setActiveObject(rectangle);
          this.mergeSelection();    
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
  
            this.cancel();
            //console.log("down line")
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
       }
    });
  
  }
  
  remove(){
    const activeObject = this.canvas.getActiveObject();
    this.cancel();
    if (activeObject){
      this.canvas.remove(activeObject);
    }else{
      const ob = this.canvas.getObjects();
      this.canvas.remove(ob[ob.length-1]);
    }
  }
  
  removeAllObjects(){
    this.blobId = 0;
    const objects = this.canvas.getObjects();
     for (const i in objects) {
      this.canvas.remove(objects[i]);
     }
  }
  
  
  cropImage(){
  
    const activeObject = this.canvas.getActiveObject();
    
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
    const activeObject = this.canvas.getActiveObject();
   
    if (activeObject && activeObject.type == 'rect'){
    
      this.cropImage();
      if (this.cropImg){
  
        const img = new Image;
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        
  
        img.onload = () =>{
  
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          if (this.Binary){
            this.mergeObjectsCoords(imageData.data, width, height, activeObject);
          }else{
            this.workerService.run(GPP, {imageData:imageData,  dw:5, k:2.0, R:128, q:1.7, p1:0.5, p2:0.7, upsampling:true, dw1:5})
            .then( (result:any) => {
                   this.mergeObjectsCoords(result.data, width, height, activeObject);              
              }
            ).catch(console.error);

          }      
        }
        img.src = this.cropImg;
  
       
      }
    }
   
  }

  mergeObjectsCoords(data:Uint8ClampedArray, width:number, height:number, activeObject){

    let yTop:number = 0;
    let yBottom:number = 0;
    let flag_yTop:boolean = true;
    let xRight:number = 0;
    let xLeft:number = 0;
    let flag_xLeft:boolean = true;

    for (let i = 0; i < height; i++)
    {
     for (let k = 0; k < width; k++)
     {
         
       if ( data[4 * k + i * 4 * width] == 0 ){
             if ( flag_yTop == true){
               yTop= i;
               flag_yTop = false;
             } 
             yBottom = height - i - 1; 
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
             xRight = width - k - 1; 
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

   this.CalcTextInputCords(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, activeObject.oCoords.tr.x - activeObject.oCoords.tl.x + 1);
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
  
  
  displayTextInput(){
    if (!this.showTextInput){
        const activeObject = this.canvas.getActiveObject();
  
        if (activeObject && activeObject.type == 'rect'){
          this.showTextInput = true;
          this.id = activeObject.id;
        
          this.CalcTextInputCords(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, activeObject.oCoords.tr.x - activeObject.oCoords.tl.x + 1);
          setTimeout(()=>{
            this.inputField.nativeElement.focus();
          },0);

          this.canvas.on("selection:updated", (e:any) =>{
            const obj = e.target;
      
            if (obj && obj.type == 'rect'){
              this.id = obj.id;
              this.CalcTextInputCords(obj.oCoords.tl.x, obj.oCoords.tl.y, obj.oCoords.tr.x - obj.oCoords.tl.x + 1);
              setTimeout(()=>{
                this.inputField.nativeElement.focus();
              },0);
          }
          });

          this.canvas.on("selection:cleared", () =>{
              if (this.showTextInput) this.cancel();
          });


        }
     }
       
  }
  
  CalcTextInputCords(left:number, top:number, width:number){
    this.left = left + document.getElementById("wr").offsetLeft;
    this.top = top + document.getElementById("wr").offsetTop - 22;
    this.width = width;
  }
  
  writeWord(){
    if (this.words[this.id]){
        //console.log(this.words[this.id]);
        this.openSnackBar(this.words[this.id]);
        const activeObject = this.canvas.getActiveObject();
        activeObject.stroke = '#ff1a1a';
        activeObject.borderColor = '#ff1a1a';
        this.CalcNextInputCoords();
        this.canvas.renderAll();
    }
  }

  openSnackBar(word:string) {
    this.snackBar.openFromComponent(WordSnackBarComponent, {
      duration: 500,
      data: word
    });
  }

  save(){
    for(const i in this.words){
      if (this.words[i] && this.words[i] != "undefined"){
        this.savejsonService.addword(this.imageName, this.words[i]);
      } 
    }
    this.updateEvent.emit(true);
  }

  saveSegments(){
    const objects = this.canvas.getObjects().filter(obj => obj.type == 'rect');
    const ratio = this.canvasWidth / this.image.width;
    const Segments:TextSegments[] = [];
    for(const i in objects){
         const x = Math.floor(objects[i].left / ratio);
         const y = Math.floor(objects[i].top / ratio);
         const w = Math.floor(objects[i].width / ratio);
         const h = Math.floor(objects[i].height / ratio);
         const word = this.words[objects[i].id];

         const segment:TextSegments = {x:x, y:y, width:w, height:h, word:word};
         Segments.push(segment);
    }
    console.log(Segments);
  }

  CalcNextInputCoords(){
    const activeObject = this.canvas.getActiveObject();
    const objects = this.canvas.getObjects().filter(obj => obj.type == 'rect');
    const obIndex = objects.indexOf(activeObject);
    let nextOb:any;
    if (obIndex == objects.length - 1){
      //nextOb = activeObject;
      return;
    }else{
      nextOb = objects[obIndex + 1];
    }
    this.CalcTextInputCords(nextOb.oCoords.tl.x, nextOb.oCoords.tl.y, nextOb.oCoords.tr.x - nextOb.oCoords.tl.x + 1);
    setTimeout(()=>{
    this.inputField.nativeElement.focus();
    },0);
    this.canvas.setActiveObject(nextOb);
  }
  
  cancel() {
    this.showTextInput = false;
    this.canvas.off('selection:updated');
    this.canvas.off('selection:cleared');
  }
  
  @HostListener('document:keyup.control.space', ['$event']) 
    onKeydownEnter(event: KeyboardEvent) {
      if (this.canvas){     
          this.displayTextInput();
      }
    }
  
  @HostListener('document:keyup.control.backspace', ['$event']) 
    onKeydownBackspace(event: KeyboardEvent) {
      if (this.canvas){
        this.remove();
     }
    }
  
  WordsSegment(){
    this.cancel();
    this.removeAllObjects();
      this.Segmloader = true;
      if (this.Binary){
          this.Segmentation(this.imagedata);
      }else{
        
      this.workerService.run(GPP, {imageData:this.imagedata,  dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
      .then( (result:any) => {
  
          this.Segmentation(result);
        }
      ).catch(console.error);
  
      }
  }
  
  Segmentation(imageData:ImageData){

    this.workerService.run(GetSegments, {imageData:imageData, ARLSA_a:this.ARLSA_a, ARLSA_c:this.ARLSA_c, ARLSA_Th:this.ARLSA_Th, RemovePunctuationMarks:this.RemovePunctuationMarks})
          .then( (objects:any) => {
  
            //console.log(objects)
            this.DrawRects(objects);
            this.Segmloader = false;
          }
        ).catch(console.error);
  }
  
  DrawRects(rects:blobObject[]){
      const ratio = this.canvasWidth / this.image.width;
      for(const i in rects){  
        const x1 = rects[i].x * ratio;
        const y1 = rects[i].y * ratio;
        const x2 = rects[i].width * ratio;
        const y2 = rects[i].height * ratio;
  
        const rectangle = new fabric.Rect({ 
          left: x1,
          top: y1,
          fill: 'transparent',
          /* strokeDashArray: [5, 5],   <-- for dashed Rect-line borders -->
          strokeLineCap: 'square', */
          opacity: 1,
          width: x2,
          height: y2,
          borderColor: '#00b300',
          cornerColor: '#004d00',
          hasRotatingPoint:false,
          objectCaching: false,
          stroke: '#00b300',
          strokeWidth: 1,
          transparentCorners: false,
          cornerSize: 6,
          id: this.blobId++
        });
        this.canvas.add(rectangle);     
      }
  }
  
  restore(){
    this.ARLSA_a= 1;
    this.ARLSA_c = 0.7;
    this.ARLSA_Th = 3.5;
  }

}
