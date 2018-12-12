import { Component, ViewChild, AfterViewInit, AfterViewChecked} from '@angular/core';
import { BinarizationComponent } from '../binarization/binarization.component';
import { ImageInfoComponent } from "../image-info/image-info.component";


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterViewInit, AfterViewChecked {

  ImgUrl:any;
  ImgName:string;
  
  @ViewChild(BinarizationComponent) Binarization;
  @ViewChild(ImageInfoComponent) ImageInfo;

  ngAfterViewInit(){
        this.ImgUrl = this.Binarization.ImgUrl;   
  }

  ngAfterViewChecked(){
    this.ImgUrl = this.Binarization.ImgUrl;
    this.ImgName = this.Binarization.ImageName;
  }


  updateTable($event){
    this.ImageInfo.showImageInfo();

  }

}
