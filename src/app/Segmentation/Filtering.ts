import MyARLSA from './MyARLSA';
import BlobCounter from './BlobCounter';
import ApplyInvert from './ApplyInvert';
import copy from "./copy";

interface blobObject{
    Array:boolean[][];
    x:number;
    y:number;
    height:number;
    width:number;
    Right:number;
    Bottom:number;
    Density:number;
    Elongation:number;
}
export default class Filtering{
    
    private RejBlobs:blobObject[];
    private FirstPassBlobs:blobObject[];
    private InitBlobs:blobObject[];
    private ARLSA:MyARLSA;

    public Filtering(arlsa:MyARLSA){
       this.RejBlobs = [];
       this.FirstPassBlobs = [];
       this.ARLSA = arlsa;
    }

    public FilterOut(initmyImage:ImageData, PunctuationMarks:boolean = true):ImageData{
        this.RejBlobs = [];
        this.FirstPassBlobs = [];
        const myImage:ImageData = initmyImage;

        const blobCounter = new BlobCounter(); 
        //this.InitBlobs = blobCounter.GetObjectsWithArray(ApplyInvert(initmyImage));
        this.InitBlobs = blobCounter.GetObjectsWithArray(initmyImage);
   
        //const objectsCount = blobCounter.getObjectsCount();
        //console.log("objectsCount:", objectsCount);
         
        this.InitFilter();
        this.Filter();
        this.Remove(myImage, this.RejBlobs);

        this.FirstPassBlobs = [];
        this.RejBlobs = [];
        
        if (PunctuationMarks){
            this.RemovePanctuation(myImage);
            this.Remove(myImage, this.RejBlobs);
        }
        

        return myImage;      
    }

    private RemovePanctuation(myImage:ImageData):void{
        const previos_a:number = this.ARLSA.ARLSA_a;
        this.ARLSA.ARLSA_a = 1.5;
        
        const imgi2:ImageData = this.ARLSA.PLAImage(copy(myImage));

        //const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");   //<-----------------------display img to canvas
        //const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        //ctx.putImageData(imgi2,0,0);

        this.ARLSA.ARLSA_a = previos_a;

        const blobCounter = new BlobCounter();
        //const blobs = blobCounter.GetObjectsWithoutArray(ApplyInvert(imgi2)); 
        //const blobs = blobCounter.GetObjectsWithoutArray(imgi2);
        const blobs = blobCounter.GetObjectsWithArray(imgi2);

        const stride = 4 * imgi2.width;
        let p1:number, p2:number;
        for(const b in blobs)
        {
            p1 = 0; p2 = 0;
            for (let y = 0; y < blobs[b].height; y++)
            {
                for (let x = 0; x < blobs[b].width; x++)
                {
                    if (myImage.data[4 * (blobs[b].x + x) + (blobs[b].y + y) * stride] == 0)
                    {
                        p1++;
                    }
                    if (imgi2.data[4 * (blobs[b].x + x) + (blobs[b].y + y) * stride] == 0)
                    {
                        p2++;
                    }
                }
            }
            if ((p2 / p1) - (this.ARLSA.Pr) <= 0) //((p2 / p1).CompareTo(ARLSA.Pr) <= 0)
                    this.RejBlobs.push(blobs[b]);

        }
    }

    public Filter():void{
        //const  AHE = this.AHE(AHE_Number);
        let sum = 0;
        for(const b in this.FirstPassBlobs){
           sum += this.FirstPassBlobs[b].height;
        }
        const AHE = Math.round(sum / this.FirstPassBlobs.length);

        this.CalcDensityAndElong();

        for(const b in this.FirstPassBlobs){
            if (//this.FirstPassBlobs[b].height <= AHE / 4 ||
                this.FirstPassBlobs[b].Density <= 0.05 || 
                this.FirstPassBlobs[b].Density >= 0.9 || 
                this.FirstPassBlobs[b].Elongation <= 0.08)
                {
                     this.RejBlobs.push(this.FirstPassBlobs[b]);
                }
        }

    }

    private InitFilter():void{
        for(const b in this.InitBlobs)
            {
                if (this.InitBlobs[b].width > 5 && this.InitBlobs[b].height > 5)
                    this.FirstPassBlobs.push(this.InitBlobs[b]);
                else
                    this.RejBlobs.push(this.InitBlobs[b]);
            }
    }

    public FinalFiltering(InputBlobs:blobObject[], PassBlobs:blobObject[], RejBlobs:blobObject[]):void{
          
        PassBlobs.length = 0; //PassBlobs = [];
        RejBlobs.length = 0;  //RejBlobs = [];
        for(const b in InputBlobs){
            if (InputBlobs[b].width <= 2 || InputBlobs[b].height <= 2)
                RejBlobs.push(InputBlobs[b]);
            else
                PassBlobs.push(InputBlobs[b]);
        }
    }

    private Remove(myImage:ImageData, RemBlobs:blobObject[]):void{
         const stride = myImage.width * 4;
         for(const b in RemBlobs){

            for (let yy = 0; yy < RemBlobs[b].height; yy++){
                for (let xx = 0; xx < RemBlobs[b].width; xx++){
                     if (RemBlobs[b].Array[yy][xx])
                     {
                           myImage.data[4 * (RemBlobs[b].x + xx) + (RemBlobs[b].y + yy) * stride] = 255;
                           myImage.data[4 * (RemBlobs[b].x + xx) + (RemBlobs[b].y + yy) * stride + 1] = 255;
                           myImage.data[4 * (RemBlobs[b].x + xx) + (RemBlobs[b].y + yy) * stride + 2] = 255;
                           myImage.data[4 * (RemBlobs[b].x + xx) + (RemBlobs[b].y + yy) * stride + 3] = 255;
                     }
                }
            }
         }
    }

    public CalcDensityAndElong():void{
         let blacks = 0;
         for(const b in this.FirstPassBlobs){
            blacks = 0;
            for (let y = 0; y < this.FirstPassBlobs[b].height; y++){
                for (let x = 0; x < this.FirstPassBlobs[b].width; x++){
                    if (this.FirstPassBlobs[b].Array[y][x]) { blacks++; }
                }
            }

            this.FirstPassBlobs[b].Density = blacks / (this.FirstPassBlobs[b].width * this.FirstPassBlobs[b].height);
            this.FirstPassBlobs[b].Elongation = Math.min(this.FirstPassBlobs[b].width, this.FirstPassBlobs[b].height) / Math.max(this.FirstPassBlobs[b].width, this.FirstPassBlobs[b].height);
                            
         } 
    }

    public AHE(Numbers:number):number{
        const heightValues = this.FirstPassBlobs.map(v => v.height);
        const Max = Math.max(...heightValues);

        const leng = this.FirstPassBlobs.length - 1;

        let histogram:number[] = [];
        for(let i = 0; i < Max + 1; i++){
            histogram[i] = 0;
        }
        
        for (let i = 0; i < Numbers; i++)
        {
            const temp = Math.floor(Math.random() * leng); 
            histogram[this.FirstPassBlobs[temp].height]++;
        }
        const maxv:number = Math.max(...histogram);

        return histogram.indexOf(maxv); //histogram.Select((x, index) => index).Where(x => histogram[x] == maxv).Single();
    }




}