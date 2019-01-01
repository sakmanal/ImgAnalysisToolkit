declare function postMessage(message: any): void;

export const test = (input) => {
    let x = 0;
    for (let i=0; i<=100000000; i++){
        x +=input;
    }
    //console.log(x)
    postMessage(x);
};