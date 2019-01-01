import { Component, OnInit } from '@angular/core';
import { WebworkerService } from '../worker/webworker.service';
import { test } from './worker.script';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  constructor(private workerService: WebworkerService){}

  ngOnInit(){
    this.workerService.run(test, 1).then(
      (result) => {
        console.log(result);
      }
    ).catch(console.error);
  }

}
