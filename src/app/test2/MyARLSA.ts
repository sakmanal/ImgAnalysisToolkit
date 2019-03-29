import BlobCounter from './BlobCounter';
import Filtering from './Filtering';
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


export default class MyARLSA{

    private myimage:ImageData;
    private CCsLabelsArray:number[][];

    public readonly Lines_Thr:number = 20;
    public readonly Lines_MinWidth:number = 30;
    public readonly Morph_Closing:number = 1;
    public ARLSA_a:number = 1;
    public readonly ARLSA_c:number = 0.7;
    public readonly ARLSA_Th:number = 3.5;
    public readonly Pr:number = 1.15;
    public readonly RemoveLines:boolean = true;

    public run(BinaryImage:ImageData):blobObject[]{
        
        this.myimage = new ImageData(BinaryImage.data, BinaryImage.width, BinaryImage.height);
        
        return
    }

    public PLAImage(CustomImage:ImageData):ImageData{
         return this.DynHorRLA(this.ARLSA_Th, this.ARLSA_c, this.ARLSA_a, CustomImage);
    }

    private DynHorRLA(HeightRatio_th:number, overlapping_c:number, blockdistance_a:number, CustomImage:ImageData = null):ImageData{
        
        let myBlobs:object;
        let I:number, J:number, id:number, id2:number, K:number, L:number, M:number, bW:number, bH:number, Store:number, CCH1:number, CCH2:number, CCX1:number, CCX2:number, BDistance:number, Hoverlapping:number, MinHeight:number;
        let HRatio:number;
        let CC1:blobObject, CC2:blobObject;

        
        const myimageCopy = new ImageData(this.myimage.data, this.myimage.width, this.myimage.height )
        const myBMP:ImageData = (CustomImage == null) ? myimageCopy : CustomImage;

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
        
        const temp_ccs:number[] = [];
        let maxcc:number;

       


        
        return myBMP;
    }
}