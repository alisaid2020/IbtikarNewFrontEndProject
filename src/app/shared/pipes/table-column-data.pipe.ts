import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tableColumnData',
})
export class TableColumnDataPipe implements PipeTransform {
  columnData: any;

  transform(columnHeader: any, rowData?: any): any {
    this.columnData = rowData[columnHeader];

    if (columnHeader.includes('.')) {
      let key = columnHeader.split('.');
      this.columnData = rowData[key[1]];
      if (rowData[key[0]]) {
        this.columnData = rowData[key[0]][key[1]];
      }
    }
    return this.columnData;
  }
}
