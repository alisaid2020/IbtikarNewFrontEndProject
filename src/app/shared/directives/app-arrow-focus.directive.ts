import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAppArrowFocus]',
})
export class AppArrowFocusDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        this.focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        this.focusPrevious();
        break;
    }
  }

  focusNext() {
    let nextElement: HTMLElement = this.el.nativeElement.nextElementSibling;
    if (nextElement) {
      nextElement?.querySelector('input')?.focus();
    }
  }

  focusPrevious() {
    let previousElement: HTMLElement =
      this.el.nativeElement.previousElementSibling;
    if (previousElement) {
      previousElement?.querySelector('input')?.focus();
    }
  }
}
