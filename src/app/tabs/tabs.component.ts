import { Component, ViewChild, AfterViewChecked} from '@angular/core';
import { BinarizationComponent } from '../binarization/binarization.component';
import { ImageInfoComponent } from "../image-info/image-info.component";


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterViewChecked {

  ImgUrl:any;
  ImgName:string;
  
  @ViewChild(BinarizationComponent) Binarization;
  @ViewChild(ImageInfoComponent) ImageInfo;

  

  ngAfterViewChecked(){
    this.ImgUrl = this.Binarization.ImgUrl;
    this.ImgName = this.Binarization.ImageName;
  }


  updateTable(event:MessageEvent){
    this.ImageInfo.showImageInfo();

  }

}
