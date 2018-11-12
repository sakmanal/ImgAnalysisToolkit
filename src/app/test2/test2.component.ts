import { Component } from '@angular/core';
//import Jcrop from 'jcrop';

//declare var Jcrop:any;

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component  {

  mouseWheelDir: string = '';
  imgWidth: number = 400;

  mouseWheelUpFunc() {
    console.log('mouse wheel up');
    if (this.imgWidth <= window.innerWidth) 
        this.imgWidth = this.imgWidth+10;
  }

  mouseWheelDownFunc() {
    console.log('mouse wheel down');
     if (this.imgWidth >= 300) 
         this.imgWidth = this.imgWidth-10;
  }


}
