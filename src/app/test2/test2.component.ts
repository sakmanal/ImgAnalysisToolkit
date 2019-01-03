import { Component, OnInit, ViewChild } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SauvolaMethod from 'src/app/binarization methods/sauvola/sauvola-method';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  img = new Image;
  url:any;
  @ViewChild("canvasfilter") fcanvas;
  faSpinner = faSpinner;
  public SauvolaImage: SauvolaMethod =  new SauvolaMethod();

  //sauvola parameters
    masksize:number = 8;
    stathera:number = 25;
    rstathera:number = 512;
    n:number = 1;

  ngOnInit(){

  }

  onSelectFile(event:any):void {
    var reader = new FileReader();
    
    reader.onload = (event:any) =>{
      this.url = event.target.result;
      this.view();
      
      
    };
    
    reader.readAsDataURL(event.target.files[0]);
  }

  view():void{
    
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    
    
    this.img.onload = () =>{
     
  
        const w = this.img.width;
        const h = this.img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(this.img, 0, 0);
        
  
        
        
    };
    this.img.src = this.url;

}


sauvolaBinarization(){
  this.SauvolaImage.binarize(this.url, this.masksize, this.stathera, this.rstathera, this.n);
}


}
