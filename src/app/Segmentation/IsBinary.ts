declare function postMessage(message: any): void;

export const IsBinary = (image:ImageData) => {
    
    let IsBinary:boolean = true;

    for(let i = 0; i < image.data.length; i++){
        if (image.data[i] !=0 && image.data[i] !=255){
            IsBinary = false;
            break;
        }
   }


    postMessage(IsBinary);
}