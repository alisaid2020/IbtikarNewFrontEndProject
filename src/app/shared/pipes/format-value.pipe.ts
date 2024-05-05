import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatValue',
})
export class FormatValuePipe implements PipeTransform {
  ISOregex =
    /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*)?)(?:(?:-(?:\d{2}):(?:\d{2})|Z)?)$/;
  transform(value: any): any {
    if (this.ISOregex.test(value)) {
      value = new DatePipe('en-us').transform(value, 'dd/MM/yyyy');
    }
    return value;
  }
}
