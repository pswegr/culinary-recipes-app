import { Directive, ElementRef, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ThemeModeService } from '../services/theme-mode.service';
import { RGB } from '../models/rgb.model';

@Directive({
  selector: '[appImageAvgColor]'
})
export class ImageAvgColorDirective implements OnInit {
  @ViewChild('img')
  image!: ElementRef;
  rgb: RGB = {r: 0, g:0, b:0}
  constructor(private themeModeService: ThemeModeService, private el: ElementRef, private renderer: Renderer2, private injector: Injector) {

   }
  ngOnInit(): void {
    setTimeout(() => {
      const img : any = this.el.nativeElement.querySelector('.r-img');
      this.rgb = this.getAverageRGB(img);
      this.el.nativeElement.querySelector('.r-title').style.color = 'rgb(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ')';
    }, 10000)

  }

  getAverageRGB(el: any) {
    
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }
    
    height = canvas.height = el.naturalHeight || el.offsetHeight || el.height;
    width = canvas.width = el.naturalWidth || el.offsetWidth || el.width;
    
    context.drawImage(el, 0, 0);
    el.crossOrigin = "anonymous"
    
    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert(e);
        return defaultRGB;
    }
    
    length = data.data.length;
    
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
  }

}
