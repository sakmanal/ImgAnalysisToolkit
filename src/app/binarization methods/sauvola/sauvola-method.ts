import * as workerPath from "file-loader?name=[name].js!./sauvola-worker";

/* ----- import Canvasdata to any component, to get imagedata ----- */
//export let Canvasdata:any; 

export default class SauvolaMethod {


    img = new Image;
    sauvolaloader: boolean = false;
    
    constructor() {}

    binarize(url:any,  masksize:number, stathera:number, rstathera:number, n:number){
        const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.sauvolaloader = true;
       
        
        this.img.onload = () =>{
          
            const w = this.img.width;
            const h = this.img.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(this.img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, w, h);
            const worker = new Worker(workerPath);           //worker can also be made with webworker.service from here
            
            worker.postMessage({imageData, masksize:masksize, stathera:stathera, rstathera:rstathera, n:n}, [imageData.data.buffer]);
            //worker.onmessage = this.handleMessage;
            worker.onmessage = (d: MessageEvent)=>{
                const imageData = d.data;
                ctx.putImageData(imageData, 0, 0);
                this.sauvolaloader = false;
                //Canvasdata = canvas.toDataURL("image/png", 1);
                
            };
        };
       this.img.src = url;
    }

  
    /* ----- worker.onmessage can also be implemented by below method -----*/

    /* private handleMessage( this: Worker, message: MessageEvent ) {

        console.log( message.data );

    } */
}