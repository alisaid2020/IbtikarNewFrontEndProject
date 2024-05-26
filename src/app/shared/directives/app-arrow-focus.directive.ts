import { Directive, ElementRef, HostListener } from '@angular/core';
import { EBTIKARLANG } from '@constants/general.constant';
import { HelpersService } from '@services/helpers.service';

@Directive({
  selector: '[appAppArrowFocus]',
})
export class AppArrowFocusDirective {
  constructor(private el: ElementRef, private helpers: HelpersService) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const td = this.el.nativeElement.closest('td');
    const tr = td.parentElement;
    const allCells: any = Array.from(tr.querySelectorAll('td'));
    const index = allCells.indexOf(td);
    const allRows = Array.from(tr.parentElement.querySelectorAll('tr'));
    const rowIndex = allRows.indexOf(tr);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        if (this.helpers.getItemFromLocalStorage(EBTIKARLANG) === 'en') {
          nextIndex = index > 0 ? index - 1 : index;
        } else {
          nextIndex = index < allCells.length - 1 ? index + 1 : index;
        }
        break;
      case 'ArrowRight':
        if (this.helpers.getItemFromLocalStorage(EBTIKARLANG) === 'en') {
          nextIndex = index < allCells.length - 1 ? index + 1 : index;
        } else {
          nextIndex = index > 0 ? index - 1 : index;
        }
        break;
      case 'ArrowUp':
        nextIndex = index;
        if (rowIndex > 0) {
          const prevRow: any = allRows[rowIndex - 1];
          nextIndex = Math.min(nextIndex, prevRow.children.length - 1);
          this.focusNextElement(prevRow.children[nextIndex]);
        }
        break;
      case 'ArrowDown':
        nextIndex = index;
        if (rowIndex < allRows.length - 1) {
          const nextRow: any = allRows[rowIndex + 1];
          nextIndex = Math.min(nextIndex, nextRow.children.length - 1);
          this.focusNextElement(nextRow.children[nextIndex]);
        }
        break;
      default:
        return;
    }

    if (nextIndex !== undefined && nextIndex !== index) {
      this.focusNextElement(allCells[nextIndex]);
    }
  }

  focusNextElement(cell: HTMLElement) {
    const input = cell.querySelector('input, textarea');
    const ngSelect = cell.querySelector('.ng-select');

    if (input) {
      (input as HTMLElement).focus();
    } else if (ngSelect) {
      (ngSelect as HTMLElement).focus();
    }
  }
}
