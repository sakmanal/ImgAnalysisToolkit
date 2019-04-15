declare function postMessage(message: any): void;
//import MyARLSA from '../Segmentation/MyARLSA';

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

interface rect{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
}

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

interface blobObjectImages{
    Array:Uint8ClampedArray;
    x:number;
    y:number;
    height:number;
    width:number;
    Right:number;
    Bottom:number;
    Density:number;
    Elongation:number;
}

export const GetSegments = (d:any) => {

    function copy(image:ImageData):ImageData{

        const img:ImageData = new ImageData(image.width, image.height);

        for(let i = 0; i < img.data.length; i++){
            img.data[i] = image.data[i];
        }

        return img;
    }

    class MyARLSA{

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

        public run(BinaryImage:ImageData, PunctuationMarks:boolean = true):blobObject[]{
            
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
                //const lines:Lines = new Lines();
                //removelines = lines.RemoveLines(copy(this.myimage), this.Lines_Thr, this.Lines_MinWidth, initblobs1);

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
            this.myimage = myFilter.FilterOut(new ImageData(removelines.data, removelines.width, removelines.height ), PunctuationMarks);

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

    class Filtering{
        
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

    class BlobCounter {

        constructor() {}

        private objectsCount:number;
        private objectLabels:number[];

        public getObjectsCount():number{
            return this.objectsCount;
        }

        public getObjectLabels():number[]{
            return this.objectLabels;
        }

        // ProcessImage is only builds object labels map and count objects
        public ProcessImage(src1:Uint8ClampedArray, width:number, height:number):void{

            // no-no-no, we don't want one pixel width images
            if (width == 1)
                throw "Too small image";

            // allocate labels array
            this.objectLabels = [];
            for (let i = 0; i < width*height; i++)
            {
                this.objectLabels[i] = 0 ;
            }
            // initial labels count
            let labelsCount = 0;
            
            // create map
            const maxObjects = ((width / 2) + 1) * ((height / 2) + 1) + 1;
            let map:number[] = [];

            // initially map all labels to themself
            for (let i = 0; i < maxObjects; i++)
            {
                map[i] = i;
            }
            let p = 0, src = 0;
            const srcStride = 4 * width;

            // 1 - for pixels of the first row
            if (src1[src] != 0)
            {
                this.objectLabels[p] = ++labelsCount;
            }
            src += 4;
            ++p;

            for (let x = 1; x < width; x++, src += 4, p++)
            {
                // check if we need to label current pixel
                if (src1[src] != 0)
                {
                    // check if the previous pixel already labeled
                    if (src1[src - 4] != 0)
                    {
                        // label current pixel, as the previous
                        this.objectLabels[p] = this.objectLabels[p - 1];
                    }
                    else
                    {
                        // create new label
                        this.objectLabels[p] = ++labelsCount;
                    }
                }
            }

            // 2 - for other rows
            // for each row
            for (let y = 1; y < height; y++)
                {
                    // for the first pixel of the row, we need to check
                    // only upper and upper-right pixels
                    if (src1[src] != 0)
                    {
                        // check surrounding pixels
                        if (src1[src - srcStride] != 0)
                        {
                            // label current pixel, as the above
                            this.objectLabels[p] = this.objectLabels[p - width];
                        }
                        else if (src1[src + 4 - srcStride] != 0)
                        {
                            // label current pixel, as the above right
                            this.objectLabels[p] = this.objectLabels[p + 1 - width];
                        }
                        else
                        {
                            // create new label
                            this.objectLabels[p] = ++labelsCount;
                        }
                    }
                    src += 4;
                    ++p;

                    // check left pixel and three upper pixels
                    for (let x = 1; x < width - 1; x++, src += 4, p++)
                    {
                        if (src1[src] != 0)
                        {
                            // check surrounding pixels
                            if (src1[src - 4] != 0)
                            {
                                // label current pixel, as the left
                                this.objectLabels[p] = this.objectLabels[p - 1];
                            }
                            else if (src1[src - 4 - srcStride] != 0)
                            {
                                // label current pixel, as the above left
                                this.objectLabels[p] = this.objectLabels[p - 1 - width];
                            }
                            else if (src1[src - srcStride] != 0)
                            {
                                // label current pixel, as the above
                                this.objectLabels[p] = this.objectLabels[p - width];
                            }

                            if (src1[src + 4 - srcStride] != 0)
                            {
                                if (this.objectLabels[p] == 0)
                                {
                                    // label current pixel, as the above right
                                    this.objectLabels[p] = this.objectLabels[p + 1 - width];
                                }
                                else
                                {
                                    const l1 = this.objectLabels[p];
                                    const l2 = this.objectLabels[p + 1 - width];

                                    if ((l1 != l2) && (map[l1] != map[l2]))
                                    {
                                        // merge
                                        if (map[l1] == l1)
                                        {
                                            // map left value to the right
                                            map[l1] = map[l2];
                                        }
                                        else if (map[l2] == l2)
                                        {
                                            // map right value to the left
                                            map[l2] = map[l1];
                                        }
                                        else
                                        {
                                            // both values already mapped
                                            map[map[l1]] = map[l2];
                                            map[l1] = map[l2];
                                        }

                                        // reindex
                                        for (let i = 1; i <= labelsCount; i++)
                                        {
                                            if (map[i] != i)
                                            {
                                                // reindex
                                                let j = map[i];
                                                while (j != map[j])
                                                {
                                                    j = map[j];
                                                }
                                                map[i] = j;
                                            }
                                        }
                                    }
                                }
                            }

                            if (this.objectLabels[p] == 0)
                            {
                                // create new label
                                this.objectLabels[p] = ++labelsCount;
                            }
                        }
                    }

                    // for the last pixel of the row, we need to check
                    // only upper and upper-left pixels
                    if (src1[src] != 0)
                    {
                        // check surrounding pixels
                        if (src1[src - 4] != 0)
                        {
                            // label current pixel, as the left
                            this.objectLabels[p] = this.objectLabels[p - 1];
                        }
                        else if (src1[src - 4 - srcStride] != 0)
                        {
                            // label current pixel, as the above left
                            this.objectLabels[p] = this.objectLabels[p - 1 - width];
                        }
                        else if (src1[src - srcStride] != 0)
                        {
                            // label current pixel, as the above
                            this.objectLabels[p] = this.objectLabels[p - width];
                        }
                        else
                        {
                            // create new label
                            this.objectLabels[p] = ++labelsCount;
                        }
                    }
                    src += 4;
                    ++p;

                }

                // allocate remapping array
                let reMap:number[] = new Array(map.length);

                // count objects and prepare remapping array
                this.objectsCount = 0;
                for (let i = 1; i <= labelsCount; i++)
                {
                    if (map[i] == i)
                    {
                        // increase objects count
                        reMap[i] = ++this.objectsCount;
                    }
                }
                // second pass to compete remapping
                for (let i = 1; i <= labelsCount; i++)
                {
                    if (map[i] != i)
                    {
                        reMap[i] = reMap[map[i]];
                    }
                }
                
                // repair object labels
                for (let i = 0, n = this.objectLabels.length; i < n; i++)
                {
                    if (this.objectLabels[i]){
                    this.objectLabels[i] = reMap[this.objectLabels[i]];}
                }

        }

        // Get array of objects rectangles
        public GetObjectRectangles(src:Uint8ClampedArray, width:number, height:number):object{

            //convert black pixels(0) to 1
            //and white pixels(255) to 0 
            for(let i=0; i<src.length; i+=4){
                if (src[i] == 0) { src[i] = 1; }
                if (src[i] == 255) { src[i] = 0; }
            }

            // process the image
            this.ProcessImage(src, width, height);

            const labels:number[] = this.objectLabels;
            const count:number = this.objectsCount;

            let i:number = 0, label:number;

            // create object coordinates arrays
            const x1:number[] = [];
            const y1:number[] = [];
            const x2:number[] = [];
            const y2:number[] = [];

            for (let j = 1; j <= count; j++)
            {
                x1[j] = width;
                y1[j] = height;
                x2[j] = 0;
                y2[j] = 0;
            }

            // walk through labels array
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++, i++)
                {
                    // get current label
                    label = labels[i];

                    // skip unlabeled pixels
                    if (label == 0)
                        continue;

                    // check and update all coordinates

                    if (x < x1[label])
                    {
                        x1[label] = x;
                    }
                    if (x > x2[label])
                    {
                        x2[label] = x;
                    }
                    if (y < y1[label])
                    {
                        y1[label] = y;
                    }
                    if (y > y2[label])
                    {
                        y2[label] = y;
                    }
                }
            }

            // create rectangles
            const rects:object = {};
            for (let j = 1; j <= count; j++)
            {
                const Rectangle:rect = {x1:x1[j], y1:y1[j], x2:x2[j] - x1[j] + 1, y2:y2[j] - y1[j] + 1};
                rects[j - 1] = Rectangle;
            }

            return rects;

        }

        public GetObjectsWithoutArray(SourceImage:ImageData):blobObject[]{
            const src:Uint8ClampedArray = new Uint8ClampedArray(SourceImage.data);
            const width:number = SourceImage.width;
            const height:number = SourceImage.height;
            
            //convert black pixels(0) to 1
            //and white pixels(255) to 0 
            for(let i=0; i<src.length; i+=4){
                if (src[i] == 0) { src[i] = 1; }
                if (src[i] == 255) { src[i] = 0; }
            } 
            
            // process the image
            this.ProcessImage(src, width, height);

            const labels:number[] = this.objectLabels;
            const count = this.objectsCount;
            
            // image size
            let i:number = 0, label:number;

            // --- STEP 1 - find each objects coordinates

            // create object coordinates arrays
            const x1:number[] = [];
            const y1:number[] = [];
            const x2:number[] = [];
            const y2:number[] = [];

            for (let k = 1; k <= count; k++)
            {
                    x1[k] = width;
                    y1[k] = height;
                    x2[k] = 0;
                    y2[k] = 0;
            }

            // walk through labels array
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++, i++)
                {
                    // get current label
                    label = labels[i];

                    // skip unlabeled pixels
                    if (label == 0)
                        continue;

                    // check and update all coordinates

                    if (x < x1[label])
                    {
                        x1[label] = x;
                    }
                    if (x > x2[label])
                    {
                        x2[label] = x;
                    }
                    if (y < y1[label])
                    {
                        y1[label] = y;
                    }
                    if (y > y2[label])
                    {
                        y2[label] = y;
                    }
                }
            }
            
            // --- STEP 2 - get each object
            const objects:blobObject[] = [];

            // create each array
            for (let k = 1; k <= count; k++){
                const xmin = x1[k];
                const xmax = x2[k];
                const ymin = y1[k];
                const ymax = y2[k];
                const objectWidth = xmax - xmin + 1;
                const objectHeight = ymax - ymin + 1;

                objects[k - 1] = {Array:null, x:xmin, y:ymin, height:objectHeight, width:objectWidth, Right:xmax, Bottom:ymax, Density:null, Elongation:null};
            } 

            return objects;
        }

        // Get array of objects images
        public GetObjectsWithArray(SourceImage:ImageData):blobObject[]{
            const src:Uint8ClampedArray = new Uint8ClampedArray(SourceImage.data);
            const width:number = SourceImage.width;
            const height:number = SourceImage.height;
            
            //convert black pixels(0) to 1
            //and white pixels(255) to 0 
            for(let i=0; i<src.length; i+=4){
                if (src[i] == 0) { src[i] = 1; }
                if (src[i] == 255) { src[i] = 0; }
            }
            
            // process the image
            this.ProcessImage(src, width, height);

            const labels:number[] = this.objectLabels;
            const count = this.objectsCount;
            
            // image size
            let i:number = 0, label:number;

            // --- STEP 1 - find each objects coordinates

            // create object coordinates arrays
            const x1:number[] = [];
            const y1:number[] = [];
            const x2:number[] = [];
            const y2:number[] = [];

            for (let k = 1; k <= count; k++)
            {
                    x1[k] = width;
                    y1[k] = height;
                    x2[k] = 0;
                    y2[k] = 0;
            }

            // walk through labels array
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++, i++)
                {
                    // get current label
                    label = labels[i];

                    // skip unlabeled pixels
                    if (label == 0)
                        continue;

                    // check and update all coordinates

                    if (x < x1[label])
                    {
                        x1[label] = x;
                    }
                    if (x > x2[label])
                    {
                        x2[label] = x;
                    }
                    if (y < y1[label])
                    {
                        y1[label] = y;
                    }
                    if (y > y2[label])
                    {
                        y2[label] = y;
                    }
                }
            }
            
            // --- STEP 2 - get each object
            const objects:blobObject[] = [];

            // create each array
            for (let k = 1; k <= count; k++){
                const xmin = x1[k];
                const xmax = x2[k];
                const ymin = y1[k];
                const ymax = y2[k];
                const objectWidth = xmax - xmin + 1;
                const objectHeight = ymax - ymin + 1;

                const array = [];
                for (let i = 0; i < objectHeight; i++){
                    array[i] = [];
                }

                /* for(let y=0; y<objectHeight; y++){
                    array.push([]);
                    for(let x=0; x<objectWidth; x++){
                    array[y].push(false);
                    }
                } */

                let p = ymin * width + xmin;

                const labelsOffset = width - objectWidth;
                
                // for each line
                for (let y = ymin; y <= ymax; y++)
                {
                    // copy each pixel
                    for (let x = xmin; x <= xmax; x++, p++)
                    {
                        if (labels[p] == k)
                        {
                            array[y - ymin][x - xmin] = true;
                        }
                        else
                        {
                            array[y - ymin][x - xmin] = false;
                        }
                    }
                    p += labelsOffset;
                }

                objects[k - 1] = {Array:array, x:xmin, y:ymin, height:objectHeight, width:objectWidth, Right:xmax, Bottom:ymax, Density:null, Elongation:null}

            } 

            return objects;
        }


    // Get array of objects images
    public GetObjects(src:Uint8ClampedArray, width:number, height:number):blobObjectImages[]{


        //convert black pixels(0) to 1
        //and white pixels(255) to 0 
        for(let i=0; i<src.length; i+=4){
            if (src[i] == 0) { src[i] = 1; }
            if (src[i] == 255) { src[i] = 0; }
        }

        // process the image
        this.ProcessImage(src, width, height);

        const labels:number[] = this.objectLabels;
        const count = this.objectsCount;

        // image size
        let i:number = 0, label:number;

        // --- STEP 1 - find each objects coordinates

        // create object coordinates arrays
        const x1:number[] = [];
        const y1:number[] = [];
        const x2:number[] = [];
        const y2:number[] = [];

        for (let k = 1; k <= count; k++)
        {
                x1[k] = width;
                y1[k] = height;
                x2[k] = 0;
                y2[k] = 0;
        }

        // walk through labels array
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++, i++)
            {
                // get current label
                label = labels[i];

                // skip unlabeled pixels
                if (label == 0)
                    continue;

                // check and update all coordinates

                if (x < x1[label])
                {
                    x1[label] = x;
                }
                if (x > x2[label])
                {
                    x2[label] = x;
                }
                if (y < y1[label])
                {
                    y1[label] = y;
                }
                if (y > y2[label])
                {
                    y2[label] = y;
                }
            }
        }


        // --- STEP 2 - get each object
        const srcStride = 4 * width;
        const objects:blobObjectImages[] = [];

        // create each array
        for (let k = 1; k <= count; k++){
            const xmin = x1[k];
            const xmax = x2[k];
            const ymin = y1[k];
            const ymax = y2[k];
            const objectWidth = xmax - xmin + 1;
            const objectHeight = ymax - ymin + 1;
            const dstStride = 4 * objectWidth;
            const dst = new Uint8ClampedArray(dstStride * objectHeight);

            let p = ymin * width + xmin;

            const labelsOffset = width - objectWidth;
            let s = 0 ;
            // for each line
            for (let y = ymin; y <= ymax; y++)
            {
                // copy each pixel
                for (let x = xmin; x <= xmax; x++, p++)
                {
                    if (labels[p] == k)
                    {
                        dst[s] = src[4 * x + y * srcStride];            
                        dst[s + 1] = src[4 * x + y * srcStride + 1];     
                        dst[s + 2] = src[4 * x + y * srcStride + 2];    
                        //dst[4 * x + y * dstStride] = src[4 * (x + xmin) + (ymin + y) * srcStride]; //src correct when use: for(let x=0; x<objectWidth; x++)
                        //dst[4 * x + y * dstStride + 1] = src[4 * (x + xmin) + (ymin + y) * srcStride + 1];                    for(let y=0; x<objectHeight; y++)
                        //dst[4 * x + y * dstStride + 2] = src[4 * (x + xmin) + (ymin + y) * srcStride + 2];
                    } 
                    s+=4;
                }
                p += labelsOffset;
            }

            objects[k - 1] = {Array:dst, x:xmin, y:ymin, height:objectHeight, width:objectWidth, Right:xmax, Bottom:ymax, Density:null, Elongation:null}

        } 

        return objects;
    
    }

    }



    const arlsa = new MyARLSA(d.ARLSA_a, d.ARLSA_c, d.ARLSA_Th);
    const objects:blobObject[] = arlsa.run(d.imageData, d.RemovePunctuationMarks);

    postMessage(objects);


    

}