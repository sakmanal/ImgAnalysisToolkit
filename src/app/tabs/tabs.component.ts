import { Component, ViewChild, AfterViewInit, AfterViewChecked} from '@angular/core';
import { BinarizationComponent } from '../binarization/binarization.component';



@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterViewInit, AfterViewChecked {

  ImgUrl:any;
  
  @ViewChild(BinarizationComponent) Binarization;

  ngAfterViewInit(){
        this.ImgUrl = this.Binarization.url;
  }

  ngAfterViewChecked(){
    this.ImgUrl = this.Binarization.url;
   
  }

}
