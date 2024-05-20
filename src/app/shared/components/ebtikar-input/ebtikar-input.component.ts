import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { firstValueFrom, interval, tap } from 'rxjs';

@Component({
  selector: 'app-ebtikar-input',
  templateUrl: './ebtikar-input.component.html',
  styleUrls: ['./ebtikar-input.component.scss'],
})
export class EbtikarInputComponent implements OnInit, OnChanges {
  @Input() control: AbstractControl;
  @Input() label?: string;
  @Input() readonly?: boolean;
  @Input() type?: string;
  @Input() placeholder: string;
  @Input() patternMessage?: string;
  @Input() addon?: string;
  @Input() phoneValidation = true;
  @Output() emitChanged = new EventEmitter<any>();

  nextArrow = '<i class="fas fa-arrow-right"></i>';
  prevArrow = '<i class="fas fa-arrow-left"></i>';

  preferredCountries: CountryISO[] = [CountryISO.SaudiArabia];
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;

  validators = Validators;

  public Editor = DecoupledEditor;

  public onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  get formControl(): UntypedFormControl {
    return this.control as UntypedFormControl;
  }

  getChangedItem(ev: any): void {
    firstValueFrom(
      interval(250).pipe(
        tap((_) => {
          this.emitChanged.emit(ev);
        })
      )
    );
  }
}
