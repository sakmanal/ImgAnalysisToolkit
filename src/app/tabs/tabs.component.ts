import { Component, ViewChild, AfterViewChecked} from '@angular/core';
import { BinarizationComponent } from '../binarization/binarization.component';
import { ImageInfoComponent } from '../image-info/image-info.component';
import { WordsSegmentComponent } from '../words-segment/words-segment.component';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterViewChecked {

  ImgUrl:any;
  ImgName:string;
  initCanvas:Boolean = false;

  init:boolean = false;
  
  @ViewChild(BinarizationComponent) Binarization;
  @ViewChild(ImageInfoComponent) ImageInfo;
  @ViewChild(WordsSegmentComponent) WordsSegment;

  

  ngAfterViewChecked(){
    this.ImgUrl = this.Binarization.ImgUrl;
    this.ImgName = this.Binarization.ImageName;
  }


  updateTable(event:MessageEvent){
    this.ImageInfo.showImageInfo();
  }

  updateImage(event:MessageEvent){
    //console.log(event)
    this.WordsSegment.imageUrl = event;
    this.WordsSegment.ImageChange = true;
    /* if (this.init){
      this.WordsSegment.b();
    }else{
       this.WordsSegment.c();
       this.init = true;
    } */
    

  }

  tabSelectionChanged(event:MatTabChangeEvent){
    if (event.index == 1 /* && !this.initCanvas */){
      this.WordsSegment.xxx();
      //this.initCanvas = true;
    }

  }

}
