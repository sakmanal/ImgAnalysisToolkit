import * as workerPath from "file-loader?name=[name].js!./sauvola-worker";

/* ----- import Canvasdata to any component, to get imagedata ----- */
//export let Canvasdata:any; 

export default class SauvolaMethod {


   
    public sauvolaloader: boolean = false;
    
    constructor() {}

    public binarize(url:any,  masksize:number, stathera:number, rstathera:number, n:number, canvasId:string){
        const canvas = <HTMLCanvasElement> document.getElementById(canvasId);
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.sauvolaloader = true;
        const img = new Image;
        
       img.onload = () =>{
            
            const w = img.width;
            const h = img.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, w, h);
            const worker = new Worker(workerPath);           //worker can also be made with webworker.service from here
            
            worker.postMessage({imageData, masksize:masksize, stathera:stathera, rstathera:rstathera, n:n}, [imageData.data.buffer]);
            //worker.onmessage = this.handleMessage;
            worker.onmessage = (d: MessageEvent)=>{
                const imageData = d.data;
                ctx.putImageData(imageData, 0, 0);
                this.sauvolaloader = false;
                //Canvasdata = canvas.toDataURL("image/png", 1); // Canvasdata = imageData;
                
            };
        };
        img.src = url;
    }

  
    /* ----- worker.onmessage can also be implemented by below method -----*/

    /* private handleMessage( this: Worker, message: MessageEvent ) {

        console.log( message.data );

    } */
}