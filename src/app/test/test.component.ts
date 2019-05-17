import { Component } from '@angular/core';
import { otsu } from '../binarization/otsu.worker';
import { Sauvola } from '../binarization/Sauvola.worker';
import { GPP } from '../binarization/gpp.worker';
import { WebworkerService } from '../worker/webworker.service';

interface imageObject{
   name:string;
   url:string;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent  {

 
  ImageFiles:imageObject[] = [];

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
       const imageFile = {name:filename, url:picFile};
       this.ImageFiles.push(imageFile);
       
        
      };   
      picReader.readAsDataURL(file);
    }
  }

  binarization_otsu(){
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].url;
        this.otsu(imageDataUrl, i);
    }
  }

  binarization_sauvola(){
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].url;
        this.sauvola(imageDataUrl, i);
    }
  }

  binarization_gpp(){
    for(let i = 0; i < this.ImageFiles.length; i++){
        const imageDataUrl = this.ImageFiles[i].url;
        this.gpp(imageDataUrl, i);
    }
  }

  otsu(imageDataUrl, id){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(otsu, {imageData:imageData})
              .then( (result:any) => {
                      this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                        
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

  gpp(imageDataUrl, id){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(GPP, {imageData:imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
              .then( (result:any) => {
                      this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;
  }

  sauvola(imageDataUrl, id){

  }




  
}
