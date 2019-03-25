import MyARLSA from './MyARLSA';
import BlobCounter from './BlobCounter';
import ApplyInvert from './ApplyInvert';

interface blobObject{
    Array:boolean[][];
    x:number;
    y:number;
    height:number;
    width:number;
    Density:number;
    Elongation:number;
}
export default class Filtering{
    
    private RejBlobs:blobObject[];
    private FirstPassBlobs:blobObject[];
    private InitBlobs:object;
    private ARLSA:MyARLSA;

    public Filtering(arlsa:MyARLSA){
       this.RejBlobs = [];
       this.FirstPassBlobs = [];
       this.ARLSA = arlsa;
    }

    public FilterOut(initmyImage:ImageData, PunctuationMarks:boolean = false):ImageData{
        this.RejBlobs = [];
        this.FirstPassBlobs = [];
        const myImage:ImageData = initmyImage;

        const blobCounter = new BlobCounter(); 
        //this.InitBlobs = blobCounter.GetObjectsWithArray(ApplyInvert(initmyImage));
        this.InitBlobs = blobCounter.GetObjectsWithArray(initmyImage);

       
        const objectsCount = blobCounter.getObjectsCount();
        console.log("objectsCount:", objectsCount);
      
      
        this.InitFilter();
        this.Filter();
        this.Remove(myImage, this.RejBlobs);

        this.FirstPassBlobs = [];
        this.RejBlobs = [];

        return myImage;
        
    }

    public Filter():void{
        
        let sum = 0;
        for(const b in this.FirstPassBlobs){
           sum += this.FirstPassBlobs[b].height;
        }
        const AHE = Math.round(sum / this.FirstPassBlobs.length);

        this.CalcDensityAndElong();

        for(const b in this.FirstPassBlobs){
            if (//b.height <= (double)AHE / 4 ||
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
                //if (this.InitBlobs[b].width > 5 && this.InitBlobs[b].height > 5)
                if (this.InitBlobs[b].width > 1 && this.InitBlobs[b].height > 1)
                    this.FirstPassBlobs.push(this.InitBlobs[b]);
                else
                    this.RejBlobs.push(this.InitBlobs[b]);
            }
    }

    

    Remove(myImage, RejBlobs){

    }

    CalcDensityAndElong(){
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




}