import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tableFormColumnData',
})
export class TableFormColumnDataPipe implements PipeTransform {
  columnData: any;

  transform(field: string, rowData: any, lineFromApi: any): any {
    if (field) {
      let camelCaseText = field[0]?.toLocaleLowerCase() + field.slice(1);
      if (Object.keys(rowData)?.includes(camelCaseText)) {
        this.columnData = rowData[camelCaseText];
      } else if (lineFromApi && Object?.keys(lineFromApi)?.includes(field)) {
        this.columnData = lineFromApi[field];
      }
    }
    return this.columnData;
  }
}
