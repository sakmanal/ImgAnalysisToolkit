import {
  Component,
  ViewChild,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { binarize } from './manualThres.worker';
import { Chart } from 'chart.js';
import { WebworkerService } from '../worker/webworker.service';
import { Sauvola } from './Sauvola.worker';
import { GPP } from './gpp.worker';
import { otsu } from './otsu.worker';
import { histog } from './histogram.worker';
import binEvaluation from '../binEvaluation/binEvaluation';

@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css'],
})
export class BinarizationComponent implements OnInit {
  faSpinner = faSpinner;
  url: string = '../../assets/text-image.jpg';
  ImgUrl: string;
  value = 138;
  max = 255;
  min = 0;
  step = 1;
  @ViewChild('canvasfilter') fcanvas;
  disableImageFilter: boolean = true;
  img: HTMLImageElement = new Image();
  height: number;
  width: number = 300;
  ImageName: string = 'text-image.jpg';
  showSpinner: boolean = false;
  SauvolaSpinner: boolean = false;
  GppSpinner: boolean = false;
  OtsuSpinner: boolean = false;
  colorotsu: string = 'primary';
  colorsauvola: string = 'primary';
  colornegative: string = 'primary';
  colorgpp: string = 'primary';
  @Output() updateImageEvent = new EventEmitter<object>();
  load: boolean = false;
  GTbinName: string;
  GTbinPixels: ImageData;
  MybinPixels: ImageData;
  precision: number;
  recall: number;
  Fmeasure: number;
  loadgtIcon: boolean = false;
  readyEval: boolean = false;

  //sauvola parameters
  masksize: number = 8;
  stathera: number = 0.2;
  rstathera: number = 128;
  n: number = 4;

  //gpp parameters
  dw: number = 10;
  k: number = 0.2;
  R: number = 128;
  q: number = 0.3;
  p1: number = 0.5;
  p2: number = 0.7;
  upsampling: boolean = true;
  dw1: number = 20;

  constructor(private workerService: WebworkerService) { }

  ngOnInit() {
  this.view();
  }

  fitscreen() {
    const width = document.getElementById('main').offsetWidth;
    const r = this.img.width / this.img.height;
    const w = window.innerWidth / (window.innerHeight - 190);
    if (w > r) {
      this.width =
        (this.img.width * (window.innerHeight - 190)) / this.img.height;
    } else {
      this.width = width;
    }
  }

  mouseWheelUpFunc() {
    //console.log('mouse wheel up');
    const width = document.getElementById('main').offsetWidth;
    if (this.width <= width) this.width = this.width + 100;
  }

  mouseWheelDownFunc() {
    //console.log('mouse wheel down');
    if (this.width >= 300) this.width = this.width - 100;
  }

  onSelectFile(event: any): void {
    // called each time file input changes
    this.colorotsu = 'primary';
    this.colorsauvola = 'primary';
    this.colornegative = 'primary';
    this.colorgpp = 'primary';
    const file = event.target.files[0];
    if (file == undefined) return;
    if (!file.type.match('image')) return;

    const reader = new FileReader();
    this.load = true;

    reader.onload = (event: any) => {
      this.url = event.target.result;
      this.loadgtIcon = false;
      this.readyEval = false;
      this.view();
    };

    reader.readAsDataURL(event.target.files[0]);
    this.ImageName = event.target.files[0].name;
    //console.log(this.ImageName);
    event.target.value = ''; //enable opening the same file
  }

  onSelectGT(event: any) {
    const file = event.target.files[0];
    if (file == undefined) return;
    if (!file.type.match('image')) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const GTbinUrl = event.target.result;
      this.takeGTpixels(GTbinUrl);
    };
    reader.readAsDataURL(event.target.files[0]);
    this.GTbinName = event.target.files[0].name;
    event.target.value = ''; //enable opening the same file
  }

  restore() {
    this.colorotsu = 'primary';
    this.colorsauvola = 'primary';
    this.colornegative = 'primary';
    this.colorgpp = 'primary';

    this.ImgUrl = this.url;
    this.updateImageEvent.emit({ dataURL: this.ImgUrl, name: this.ImageName });
    this.readyEval = false;
  }

  view() {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    this.img.onload = () => {
      const width = this.img.width;
      const height = this.img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(this.img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      this.disableImageFilter = false;
      this.ImgUrl = this.url;
      this.fitscreen();
      this.load = false;
      this.HistGraph(imageData);
      this.updateImageEvent.emit({
        dataURL: this.ImgUrl,
        name: this.ImageName,
      });
    };
    this.img.src = this.url;
  }

  otsuBinarization() {
    this.colorotsu = 'warn';
    this.colorsauvola = 'primary';
    this.colornegative = 'primary';
    this.colorgpp = 'primary';
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image();
    this.showSpinner = true;
    this.OtsuSpinner = true;

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      this.workerService
        .run(otsu, { imageData: imageData })
        .then((result: any) => {
          this.MybinPixels = result;
          ctx.putImageData(result, 0, 0);
          this.ImgUrl = canvas.toDataURL('image/png', 1);
          this.showSpinner = false;
          this.OtsuSpinner = false;
          this.updateImageEvent.emit({
            dataURL: this.ImgUrl,
            name: this.ImageName,
          });
          this.readyEval = true;
        })
        .catch(console.error);
    };
    img.src = this.url;
  }

  sauvolaBinarization() {
    this.colorotsu = 'primary';
    this.colorsauvola = 'warn';
    this.colornegative = 'primary';
    this.colorgpp = 'primary';
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    this.showSpinner = true;
    this.SauvolaSpinner = true;
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      this.workerService
        .run(Sauvola, {
          imageData: imageData,
          masksize: this.masksize,
          stathera: this.stathera,
          rstathera: this.rstathera,
          n: this.n,
        })
        .then((result: any) => {
          this.MybinPixels = result;
          ctx.putImageData(result, 0, 0);
          this.ImgUrl = canvas.toDataURL('image/png', 1);
          this.showSpinner = false;
          this.SauvolaSpinner = false;
          this.updateImageEvent.emit({
            dataURL: this.ImgUrl,
            name: this.ImageName,
          });
          this.readyEval = true;
        })
        .catch(console.error);
    };
    img.src = this.url;
  }

  manualThresholdBinarization() {
    this.colorotsu = 'primary';
    this.colorsauvola = 'primary';
    this.colornegative = 'primary';
    this.colorgpp = 'primary';
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image();
    this.showSpinner = true;

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      this.workerService
        .run(binarize, { imageData: imageData, threshold: this.value })
        .then((result: any) => {
          this.MybinPixels = result;
          ctx.putImageData(result, 0, 0);
          this.ImgUrl = canvas.toDataURL('image/png', 1);
          this.updateImageEvent.emit({
            dataURL: this.ImgUrl,
            name: this.ImageName,
          });
          this.showSpinner = false;
          this.readyEval = true;
        })
        .catch(console.error);
    };
    img.src = this.url;
  }

  gppdBinarization() {
    this.colorotsu = 'primary';
    this.colorsauvola = 'primary';
    this.colornegative = 'primary';
    this.colorgpp = 'warn';
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    this.showSpinner = true;
    this.GppSpinner = true;
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      this.workerService
        .run(GPP, {
          imageData: imageData,
          dw: this.dw,
          k: this.k,
          R: this.R,
          q: this.q,
          p1: this.p1,
          p2: this.p2,
          upsampling: this.upsampling,
          dw1: this.dw1,
        })
        .then((result: any) => {
          this.MybinPixels = result;
          ctx.putImageData(result, 0, 0);
          this.ImgUrl = canvas.toDataURL('image/png', 1);
          this.showSpinner = false;
          this.GppSpinner = false;
          this.updateImageEvent.emit({
            dataURL: this.ImgUrl,
            name: this.ImageName,
          });
          this.readyEval = true;
        })
        .catch(console.error);
    };
    img.src = this.url;
  }

  save() {
    const data = this.ImgUrl;
    const link = document.createElement('a');
    link.href = data;
    link.download = this.ImageName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  HistGraph(imageData: ImageData) {
    this.workerService
      .run(histog, { imageData: imageData })
      .then((histArray: any) => {
        this.drawHistGraph(histArray);
      })
      .catch(console.error);
  }

  myChart: any;
  drawHistGraph(histArray: number[]) {
    if (this.myChart) this.myChart.destroy();

    const c = [];
    for (let i = 0; i < 256; i++) {
      c.push(i);
    }

    const canv = <HTMLCanvasElement>document.getElementById('myChart');
    const ctx = canv.getContext('2d');
    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: c,
        datasets: [
          {
            label: 'Grey-scale Histogram',
            data: histArray,
            backgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              display: false,
              barPercentage: 1,
            },
            {
              display: true,
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  takeGTpixels(GTbinUrl) {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      this.GTbinPixels = ctx.getImageData(0, 0, width, height);
      this.loadgtIcon = true;
    };
    img.src = GTbinUrl;
  }

  gtBinEval() {
    const Evaluation = new binEvaluation();
    Evaluation.run(this.MybinPixels, this.GTbinPixels);
    this.recall = Evaluation.getRecall();
    this.precision = Evaluation.getPrecision();
    this.Fmeasure = Evaluation.getFmeasure();
    //console.log(this.recall, this.precision, this.Fmesure);
  }
}
