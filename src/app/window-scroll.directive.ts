import { Directive, NgZone } from '@angular/core';

@Directive({
  selector: '[appWindowScroll]'
})
export class WindowScrollDirective {

  private eventOptions: boolean|{capture?: boolean, passive?: boolean};

    constructor(private ngZone: NgZone) {}

    ngOnInit() {            
      this.eventOptions = true;
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('scroll', this.scroll, <any>this.eventOptions);
        });
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.scroll, <any>this.eventOptions);
        //unfortunately the compiler doesn't know yet about this object, so cast to any
    }

    scroll = (): void => {
       
           this.ngZone.run(() => {
               console.log("ok")

           });
        
    };   
}
