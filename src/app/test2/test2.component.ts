import { Component, OnInit } from '@angular/core';
//import BackgroundWorker from './background-worker';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

 
  url:any;
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
      this.sauvola();
      
      
    };
    
    reader.readAsDataURL(event.target.files[0]);
  }

  sauvola(){
     //new BackgroundWorker(this.url, this.masksize, this.stathera, this.rstathera, this.n);
  }

}
