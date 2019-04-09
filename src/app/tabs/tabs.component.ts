import { Component, ViewChild} from '@angular/core';
import { BinarizationComponent } from '../binarization/binarization.component';
import { ImageInfoComponent } from '../image-info/image-info.component';
import { WordsSegmentComponent } from '../words-segment/words-segment.component';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent{

  @ViewChild(BinarizationComponent) Binarization;
  @ViewChild(ImageInfoComponent) ImageInfo;
  @ViewChild(WordsSegmentComponent) WordsSegment;

  updateTable(event:MessageEvent){
    this.ImageInfo.showImageInfo();
  }

  updateImage(event){
    //console.log(event)
    this.WordsSegment.imageUrl = event.dataURL;
    this.WordsSegment.imageName = event.name;
    this.WordsSegment.ImageChange = true;  
  }

  tabSelectionChanged(event:MatTabChangeEvent){
    if (event.index == 1 && this.WordsSegment.imageUrl){
      this.WordsSegment.handleComponentView();
    }

  }

}
