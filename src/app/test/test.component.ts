import { Component, Output, EventEmitter } from '@angular/core';
import { otsu } from '../binarization/otsu.worker';
import { Sauvola } from '../binarization/Sauvola.worker';
import { GPP } from '../binarization/gpp.worker';
import { WebworkerService } from '../worker/webworker.service';
import evaluation from '../SegmentsEvaluation/evaluation';
import { GetSegments } from '../Segmentation/MyARLSA.worker';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


interface imageObject{
   name:string;
   url:string;
   originUrl:string;
   spin:boolean;
   blobs:blobObject;
   IsBinary:boolean;
}

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

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent  {

 
  ImageFiles:imageObject[] = [];

  colorotsu:string = "primary";
  colorsauvola:string = "primary";
  colorgpp:string = "primary";

  enableView:boolean = false;
  //Totalimages:number = 0;

  constructor(private workerService: WebworkerService){}
  
    

  selectFiles(event:any):void{
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      //Only pics
      if (!file.type.match('image')) continue;

      const picReader = new FileReader();
      picReader.onload = (event:any) =>{
    
       const picFile = event.target.result;
       const imageFile = {name:filename, url:picFile, originUrl:picFile, spin:false, blobs:null, IsBinary:false};
       this.ImageFiles.push(imageFile);
       //this.Totalimages++;
        
      };   
      picReader.readAsDataURL(file);
    }
    if (files.length != 0){ this.enableView = true; }

    event.target.value = '';  //enable opening the same file
  }

  binarization_otsu(){
    this.colorotsu = "warn";
    this.colorsauvola = "primary";
    this.colorgpp = "primary"; 
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].originUrl;
        this.otsu(imageDataUrl, i);
    }
  }

  binarization_sauvola(){
    this.colorotsu = "primary";
    this.colorsauvola = "warn";
    this.colorgpp = "primary";
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].originUrl;
        this.sauvola(imageDataUrl, i);
    }
  }

  binarization_gpp(){
    this.colorotsu = "primary";
    this.colorsauvola = "primary";
    this.colorgpp = "warn"; 
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].originUrl;
        this.gpp(imageDataUrl, i);
    }
  }

  otsu(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(otsu, {imageData:imageData})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;

                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;
  }


  //gpp parameters
  dw:number = 10;
  k:number = 0.2;
  R:number = 128;
  q:number = 0.6;
  p1:number = 0.5;
  p2:number = 0.7;
  upsampling:boolean = true;
  dw1:number = 20;

  gpp(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(GPP, {imageData:imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;
  }
  


  //sauvola parameters
  masksize:number = 4;
  stathera:number = 0.5; 
  rstathera:number = 128; 
  n:number = 3;

  sauvola(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(Sauvola, {imageData:imageData, masksize:this.masksize, stathera:this.stathera, rstathera:this.rstathera, n:this.n})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;

  }

  restore(){
    this.colorotsu = "primary";
    this.colorsauvola = "primary";
    this.colorgpp = "primary";
    for(let i = 0; i < this.ImageFiles.length; i++){
      this.ImageFiles[i].url = this.ImageFiles[i].originUrl;
      this.ImageFiles[i].IsBinary = false;
    }
    
  }


  //ARLSA parameters
  ARLSA_a:number = 1;
  ARLSA_c:number = 0.7;
  ARLSA_Th:number = 3.5;
  RemovePunctuationMarks:boolean = true;

  faSpinner = faSpinner;
  Segmloader:boolean  = false;
  WordsSegment(){
    this.Segmloader = true;
    for(let i = 0; i < this.ImageFiles.length; i++){
      const imageDataUrl = this.ImageFiles[i].url;

      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      const img = new Image;

      img.onload = () =>{
        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        const imagedata = ctx.getImageData(0, 0, width, height);
        
        if (this.ImageFiles[i].IsBinary == true){
             this.Segmentation(imagedata, i);
        }else{
          this.workerService.run(GPP, {imageData:imagedata,  dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
              .then( (result:any) => {      
                  this.Segmentation(result, i);
                }
              ).catch(console.error);
        }
        

      }
      img.src = imageDataUrl;  
      
    }
  }


 
 
  counter:number = 0;
  Segmentation(imageData:ImageData, id:number){
 
     this.workerService.run(GetSegments, {imageData:imageData, ARLSA_a:this.ARLSA_a, ARLSA_c:this.ARLSA_c, ARLSA_Th:this.ARLSA_Th, RemovePunctuationMarks:this.RemovePunctuationMarks})
          .then( (objects:any) => {
   
            this.ImageFiles[id].blobs = objects; 
            this.counter++;
            //if (this.counter == this.Totalimages) { 
            if (this.counter == this.ImageFiles.length) {
              this.Segmloader = false; 
              this.counter = 0;
            }
            
          }
        ).catch(console.error);
  }

  
  remove(id:number){
    //console.log(id);

    if (id > -1) {
      this.ImageFiles.splice(id, 1);
      //this.Totalimages = this.ImageFiles.length;
    }

    if (this.ImageFiles.length == 0) { this.enableView = false }

    
  }

  removeAll(){
    this.ImageFiles = [];
    //this.Totalimages = 0;
    this.enableView = false;
  }

  @Output() updateImageEvent = new EventEmitter<object>();
  edit(id:number){
    this.updateImageEvent.emit({dataURL:this.ImageFiles[id].url, name:this.ImageFiles[id].name});
  }


  
}
