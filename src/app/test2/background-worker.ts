/* import * as workerPath from "file-loader?name=[name].js!./web-worker-example";


export default class BackgroundWorker {


    img = new Image;

    constructor(url:any,  masksize, stathera, rstathera, n) {
        
        const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        
        
        this.img.onload = () =>{
          
            var w = this.img.width;
            var h = this.img.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(this.img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, w, h);
            let worker = new Worker(workerPath);
            
            worker.postMessage({imageData, masksize:masksize, stathera:stathera, rstathera:rstathera, n:n}, [imageData.data.buffer]);
            //worker.onmessage = this.handleMessage;
            worker.onmessage = (d)=>{
                const imageData = d.data;
                ctx.putImageData(imageData, 0, 0);
            };
        };
       // this.img.src = "src/assets/document1.jpg";
       this.img.src = url;
   
    }

   

    private handleMessage( this: Worker, message: MessageEvent ) {

        console.log( message.data );

    }
} */