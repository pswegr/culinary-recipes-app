import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageAvgColor'
})
export class ImageAvgColorPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return null;
  }

}
