import BlobCounter from './BlobCounter';
import Filtering from './Filtering';
import ApplyInvert from './ApplyInvert';
import Lines from './Lines';
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


export default class MyARLSA{

    private myimage:ImageData;
    private CCsLabelsArray:number[][];

    public readonly Lines_Thr:number = 20;
    public readonly Lines_MinWidth:number = 30;
    public readonly Morph_Closing:number = 1;
    public ARLSA_a:number;
    public ARLSA_c:number;
    public ARLSA_Th:number;
    public readonly Pr:number = 1.15;
    public readonly RemoveLines:boolean = false;

    constructor(ARLSA_a:number, ARLSA_c:number, ARLSA_Th:number){
              this.ARLSA_a = ARLSA_a;
              this.ARLSA_c = ARLSA_c;
              this.ARLSA_Th = ARLSA_Th;
    }

    public run(BinaryImage:ImageData):blobObject[]{
        
        this.myimage = copy(BinaryImage);

        const blobCounter:BlobCounter = new BlobCounter();
        //const initblobs1:blobObject[] = blobCounter.GetObjectsWithoutArray(ApplyInvert(this.myimage));
        const initblobs1:blobObject[] = blobCounter.GetObjectsWithoutArray(this.myimage);
        //console.log(blobCounter.getObjectsCount())

        const WidthArray:number[] = initblobs1.map(v => v.width).filter(v => v <= 20);
        let AverageWidth:number;
        if (WidthArray.length == 0){
            AverageWidth = 0;
        }else{
             AverageWidth = WidthArray.reduce((sum, v) => sum + v) / WidthArray.length;
        }    
        const minblobwidth:number = 15 * Math.round(AverageWidth);

        //Remove Lines
        let removelines:ImageData;
        if (this.RemoveLines)
        {
            const lines:Lines = new Lines();
            removelines = lines.RemoveLines(copy(this.myimage), this.Lines_Thr, this.Lines_MinWidth, initblobs1);

            // Morphology
               
            //removelines._Not();
            //removelines._Dilate(Morph_Closing);
            //removelines._Erode(Morph_Closing);
            //removelines._Not();
        }
        else
        {
            removelines = copy(this.myimage);
        }
        
        const myFilter:Filtering = new Filtering();
        myFilter.Filtering(this);
        this.myimage = myFilter.FilterOut(new ImageData(removelines.data, removelines.width, removelines.height ));

        //const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");    //<---------------------------------display img to canvas
        //const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        //ctx.putImageData(this.myimage,0,0);

        const res:ImageData = this.DynHorRLA(this.ARLSA_Th, this.ARLSA_c, this.ARLSA_a);

        //ctx.putImageData(res,0,0);                                                      //<---------------------------------display img to canvas
        
        //const blobs:blobObject[] = blobCounter.GetObjectsWithArray(ApplyInvert(res));
        const blobs:blobObject[] = blobCounter.GetObjectsWithArray(res);

        let FinalBlobs:blobObject[] = [];
        let Rejblobs:blobObject[] = [];
        myFilter.FinalFiltering(blobs, FinalBlobs, Rejblobs);

        this.RemoveBlobs(Rejblobs, this.myimage);
        this.FillblobArray(FinalBlobs, this.myimage);

        const res2:ImageData = this.ExtractBlobs(FinalBlobs, this.myimage.width, this.myimage.height);   
        //ctx.putImageData(res2,0,0);                                                   //<---------------------------------display img to canvas
 
        const res3 = copy(res2);
        
        const tmpFinalBlobs:blobObject[] = [];
        for(const b in FinalBlobs){
            if (FinalBlobs[b].width > 10){
            //if (FinalBlobs[b].width > 15){
               tmpFinalBlobs.push(FinalBlobs[b]);
            }
        }
        FinalBlobs = tmpFinalBlobs;
    
        this.WordDetection(FinalBlobs, minblobwidth, 3, res2, res);

        let FinalBlobs2:blobObject[] = blobCounter.GetObjectsWithArray(res2);
        const tmpFinalBlobs2:blobObject[] = [];
        for(const b in FinalBlobs2){
            if (FinalBlobs2[b].width > 5 && FinalBlobs2[b].height > 5){
               tmpFinalBlobs2.push(FinalBlobs2[b]);
            }
        }
        FinalBlobs2 = tmpFinalBlobs2;

        this.FillblobArray(FinalBlobs2, res3);


        return FinalBlobs2; 
        //return FinalBlobs;
    }
    
    private FillblobArray(Fblobs:blobObject[], timg:ImageData):void{

        const stride = 4 * timg.width;
        for(const b in Fblobs){
            const newarray:boolean[][] = [];
            for (let y = 0; y < Fblobs[b].height; y++){
                newarray[y] = [];
                for (let x = 0; x < Fblobs[b].width; x++){
                    newarray[y][x] = (timg.data[4 * (Fblobs[b].x + x) + (Fblobs[b].y + y) * stride] == 0 && Fblobs[b].Array[y][x]) ? true : false;
                }
            }
            Fblobs[b].Array = newarray;
        }

    }

    private WordDetection(blobs:blobObject[], minwidth:number, Space:number, image:ImageData, arlaimg:ImageData):void{
         
        let count:number = 0;
        const stride:number = 4 * image.width;

        for(const b in blobs)
        {
            if (blobs[b].width >= minwidth)
            {
                 // Get the Vertical Projection
                 let proj:number[] = [];

                 for (let x = 0; x < blobs[b].width; x++)
                {
                    count = 0;
                    for (let y = 0; y < blobs[b].height; y++)
                    {
                        if (blobs[b].Array[y][x])
                            count++;
                    }
                    proj[x] = count;
                }

                // Get the histogram
                const histog:number[] = this.HistogramSpaces(proj);
            
                //otsu thresholding
                const thr:number = this.FindThreshold(histog) + 1;

                const letterspacing = this.GetPosofMax( histog.slice(0, thr) );  //GetPosofMax(histog.Take(thr).ToArray());
                let wordspacing = this.GetPosofMax( histog.slice(thr) );       //GetPosofMax(histog.Skip(thr).ToArray());
                wordspacing += thr;

                if ((wordspacing - letterspacing) < letterspacing)
                {
                    this.xRLSA(blobs[b].width, image, blobs[b]);
                }
                else
                {
                    this.xRLSA(Math.ceil((wordspacing + thr) / 2), image, blobs[b]);
                }
            }
            else
            {
                for (let x = blobs[b].x; x <= blobs[b].Right; x++)  //for (let x = blobs[b].x; x < blobs[b].Right; x++)
                {
                    for (let y = blobs[b].y; y <= blobs[b].Bottom; y++) //for (let y = blobs[b].y; y < blobs[b].Bottom; y++)
                    {
                        image.data[4 * x + y * stride] = arlaimg.data[4 * x + y * stride];
                        image.data[4 * x + y * stride + 1] = arlaimg.data[4 * x + y * stride + 1];
                        image.data[4 * x + y * stride + 2] = arlaimg.data[4 * x + y * stride + 2];
                    }
                }
            }
        }
    }

    private GetPosofMax(histog:number[]):number{
        if (histog.length == 0) return 0;
        /* const maxv:number = Math.max(...histog);
        return histog.indexOf(maxv); */
        let pos:number = 0; let max:number = histog[pos];
        for (let i = 1; i < histog.length; i++){
            if (max < histog[i])
            {
                max = histog[i];
                pos = i;
            }
        }
        return pos;
    }

    private xRLSA(x_c:number, img:ImageData, b:blobObject):void{

        let number:number = 0;
        let start:boolean = false;
        const stride = 4 * img.width;

        for (let y = b.y; y <= b.Bottom; y++)    //for (let y = b.y; y < b.Bottom; y++)
        {
            for (let x = b.x; x <= b.Right; x++)  //for (let x = b.x; x < b.Right; x++)
            {
                if (b.Array[y - b.y][x - b.x]  == false)
                {  
                    number++;
                    if (start == false) start = true;
                }
                else if (b.Array[y - b.y][x - b.x])
                {
                    if (start)
                    {
                        if (number <= x_c)
                        {
                            for (let i = 1; i <= number; i++)
                            {
                                img.data[4 * (x - i) + y * stride] = 0;
                                img.data[4 * (x - i) + y * stride + 1] = 0;
                                img.data[4 * (x - i) + y * stride + 2] = 0;
                            }
                        }
                        start = false;
                        number = 0;
                    }
                }
            }

            start = false;
            number = 0;
        }
    }

    private FindThreshold(histog:number[]):number{

        let sum = 0, csum = 0, threshold = 0;
        let m1 = 0, m2 = 0, sb = 0, fmax = -1;
        let n = 0, n1 = 0, n2 = 0;
        for (let k = 0; k < histog.length; k++)
        {
            sum += k * histog[k];
            n += histog[k];
        }

       for (let k = 0; k < histog.length; k++)
        {
            n1 += histog[k];
            if (n1 == 0) continue;
            n2 = n - n1;
            if (n == 0) break;
            csum += k * histog[k];
            m1 = csum / n1;
            m2 = (sum - csum) / n2;
            sb = n1 * n2 * (m1 - m2) * (m1 - m2);
            if (sb > fmax)
            {
                fmax = sb;
                threshold = k;
            }
        }

        if (threshold == 0) threshold = Math.floor(histog.length / 2);
        return threshold;
    }

    private HistogramSpaces(proj1:number[]):number[]{

        const proj:number[] = proj1.slice();
        const histog:number[] = [];
        for (let x = 0; x < proj.length; x++){
            histog.push(0);
        }
               
        const min = Math.min(...proj);
        if (min > 0)
        {
            for (let x = 0; x < proj.length; x++)
                proj[x] = proj[x] - min;
        }

        let start:boolean = false;
        let number:number = 0;
        for (let x = 0; x < proj.length; x++)
        {
            if (proj[x] == 0)
            {
                number++;
                if (start == false) start = true;
            }
            else
            {
                if (start)
                {
                    histog[number]++;
                    start = false;
                    number = 0;
                }
            }
        }

        let psr:number = histog.length - 1;
        for (let i = histog.length - 1; i >= 0; i--){
            if (histog[i] > 0)
            {
                psr = i;
                break;
            }
        } 
    
        return histog.slice(0, psr + 1);    //histog.Take(psr + 1).ToArray()
    }

    private PreFiltering(blobs:blobObject[]):blobObject[]{

        const _return1:blobObject[] = [];
        for (let i = 0; i < blobs.length; i++)
        {
            if (blobs[i].height <= this.myimage.height / 4 && blobs[i].height > 5 && blobs[i].width > 5)
            {
                _return1.push(blobs[i]);
            }
        }
        return _return1;
    } 

    public PLAImage(CustomImage:ImageData):ImageData{
         return this.DynHorRLA(this.ARLSA_Th, this.ARLSA_c, this.ARLSA_a, CustomImage);
    }

    private DynHorRLA(HeightRatio_th:number, overlapping_c:number, blockdistance_a:number, CustomImage:ImageData = null):ImageData{
        
        let myBlobs:blobObject[];
        let I:number, J:number, id:number, id2:number, K:number, L:number, M:number, bW:number, bH:number, Store:number, CCH1:number, CCH2:number, CCX1:number, CCX2:number, BDistance:number, Hoverlapping:number, MinHeight:number;
        let HRatio:number;
        let CC1:blobObject, CC2:blobObject;

        const myBMP:ImageData = (CustomImage == null) ? copy(this.myimage) : CustomImage;

        bW = myBMP.width; bH = myBMP.height;
        const stride = 4 * bW;
        
        this.CCsLabelsArray = [];
        const Temp:boolean[][] = [];
        const PassArr:boolean[][] = [];

        for(let y=0; y<bH; y++){
            Temp[y] = [];
            PassArr[y] = [];
            this.CCsLabelsArray[y] = [];
            for(let x=0; x<bW; x++){
                Temp[y][x] = false;
                PassArr[y][x] = false;
                this.CCsLabelsArray[y][x] = 0;
            }
        }
        
        const blobCounter = new BlobCounter();
        myBlobs = blobCounter.GetObjectsWithoutArray(myBMP);
        //myBlobs = blobCounter.GetObjectsWithoutArray(ApplyInvert(myBMP));
        const temp_ccs:number[] = blobCounter.getObjectLabels();
        const maxcc:number = blobCounter.getObjectsCount();

        for (let i = 0; i < bH; i++){
            for (let j = 0; j < bW; j++){
                this.CCsLabelsArray[i][j] = temp_ccs[i * bW + j];
            }
        }

        for (I = 0; I < bH; I++){
            for (J = 0; J < bW; J++){
                Temp[I][J] = (myBMP.data[I * stride + 4 * J] == 0) ? true : false;
            }
        }
        
        for (I = 1; I < bH - 1; I++)
        {
            for (J = 1; J < bW - 2; J++)
            {
                if (!PassArr[I][J])
                {
                    if (this.CCsLabelsArray[I][J] > 0 && this.CCsLabelsArray[I][J + 1] <= 0)
                    {
                        PassArr[I][J + 1] = true;
                        id = this.CCsLabelsArray[I][J];
                        CC1 = myBlobs[id - 1];
                        CCH1 = CC1.height;
                        CCX1 = CC1.Right;
                        K = J + 1; Store = K;
                        do
                        {
                            K++;
                            PassArr[I][K] = true;
                        }
                        while (this.CCsLabelsArray[I][K] == 0 && K < bW - 1);
                        PassArr[I][K] = false;
                        if (this.CCsLabelsArray[I][K] == 0) continue;

                        if (this.CCsLabelsArray[I][K] == id)
                        {
                            for (L = Store; L < K; L++)
                                Temp[I][L] = true;
                        }
                        else
                        {
                            id2 = this.CCsLabelsArray[I][K];
                            CC2 = myBlobs[id2 - 1];
                            CCH2 = CC2.height;
                            CCX2 = CC2.x;
                            HRatio = Math.max(CCH1, CCH2) / Math.min(CCH1, CCH2);
                            BDistance = CCX2 - CCX1;
                            MinHeight = Math.min(CCH1, CCH2);
                            Hoverlapping = Math.abs(Math.max(CC1.y, CC2.y) - Math.min(CC1.Bottom + 1, CC2.Bottom + 1));
                            if (HRatio <= HeightRatio_th &&
                                BDistance <= blockdistance_a * Math.min(CCH1, CCH2) &&
                                Hoverlapping >= overlapping_c * MinHeight)
                            {
                                for (L = Store; L < K; L++)
                                    if (this.CheckNeighborhood(I, L, id, id2, bW) == false)
                                    {
                                        Temp[I][L] = true;
                                    }
                                    else
                                    {
                                        for (M = Store; M <= L; M++)
                                            Temp[I][M] = false;
                                    }
                            }
                        }


                    }
                }
            }
        }

        for (I = 0; I < bH; I++){
            for (J = 0; J < bW; J++){
                if (Temp[I][J])
                {
                    myBMP.data[I * stride + 4 * J] = 0;
                    myBMP.data[I * stride + 4 * J + 1] = 0;
                    myBMP.data[I * stride + 4 * J + 2] = 0;
                }
            }
        }
        
       
        return myBMP;
    }

    private CheckNeighborhood(I:number, L:number, id:number, id2:number, bW:number):boolean{
        let Result:boolean = false;
        for (let R = I - 1; R <= I + 1; R++){
            for (let C = L - 1; C <= L + 1; C++){
                if (this.CCsLabelsArray[R][C] > 0 && this.CCsLabelsArray[R][C] != id && this.CCsLabelsArray[R][C] != id2){
                    Result = true;
                }
            }
        }

        return Result;
    }

    private RemoveBlobs(Rejblobs:blobObject[], myimage:ImageData){
        const stride = myimage.width * 4;
         for(const b in Rejblobs){

            for (let yy = 0; yy < Rejblobs[b].height; yy++){
                for (let xx = 0; xx < Rejblobs[b].width; xx++){
                     if (Rejblobs[b].Array[yy][xx])
                     {
                           myimage.data[4 * (Rejblobs[b].x + xx) + (Rejblobs[b].y + yy) * stride] = 255;
                           myimage.data[4 * (Rejblobs[b].x + xx) + (Rejblobs[b].y + yy) * stride + 1] = 255;
                           myimage.data[4 * (Rejblobs[b].x + xx) + (Rejblobs[b].y + yy) * stride + 2] = 255;
                           myimage.data[4 * (Rejblobs[b].x + xx) + (Rejblobs[b].y + yy) * stride + 3] = 255;
                     }
                }
            }
         }
    }

    private ExtractBlobs(FinalBlobs:blobObject[], width:number, height:number):ImageData{
        
        const myimage = new ImageData(width, height);
        for(let i=0; i<myimage.data.length; i++){
            myimage.data[i] = 255;
        }
        const stride = myimage.width * 4;
        for(const b in FinalBlobs){
            for (let yy = 0; yy < FinalBlobs[b].height; yy++){
                for (let xx = 0; xx < FinalBlobs[b].width; xx++){
                    if (FinalBlobs[b].Array[yy][xx])
                    {
                           myimage.data[4 * (FinalBlobs[b].x + xx) + (FinalBlobs[b].y + yy) * stride] = 0;
                           myimage.data[4 * (FinalBlobs[b].x + xx) + (FinalBlobs[b].y + yy) * stride + 1] = 0;
                           myimage.data[4 * (FinalBlobs[b].x + xx) + (FinalBlobs[b].y + yy) * stride + 2] = 0;
                           myimage.data[4 * (FinalBlobs[b].x + xx) + (FinalBlobs[b].y + yy) * stride + 3] = 255; 
                    }                
                }
            }
             
        }
        return myimage;
    }

}