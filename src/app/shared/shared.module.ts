import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDatepickerModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbProgressbar,
} from '@ng-bootstrap/ng-bootstrap';
import { NgOtpInputModule } from 'ng-otp-input';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSliderModule } from '@angular/material/slider';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { CountdownModule } from 'ngx-countdown';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ScriptsInitComponent } from '../_metronic/layout/components/scripts-init/scripts-init.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EbtikarSelectComponent } from './components/ebtikar-select/ebtikar-select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EbtikarInputComponent } from './components/ebtikar-input/ebtikar-input.component';
import { AppArrowFocusDirective } from './directives/app-arrow-focus.directive';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormatValuePipe } from './pipes/format-value.pipe';
import { TableColumnDataPipe } from './pipes/table-column-data.pipe';
import { NgxPermissionsModule } from 'ngx-permissions';

const sharedModules: any[] = [
  NgApexchartsModule,
  InlineSVGModule,
  FormsModule,
  ReactiveFormsModule,
  NgOtpInputModule,
  NgbDatepickerModule,
  NgbOffcanvasModule,
  TranslateModule,
  NgbAccordionModule,
  NgbPaginationModule,
  SweetAlert2Module,
  MatSliderModule,
  NgSelectModule,
  NgbNavModule,
  NgbProgressbar,
  // NgbDropdownModule,
  MatCheckboxModule,
  // NgbTooltipModule,
  CountdownModule,
  DragDropModule,
  FlatpickrModule,
  NgxIntlTelInputModule,
  NgxSpinnerModule,
  BsDatepickerModule.forRoot(),
  CKEditorModule,
  NgxMaterialTimepickerModule,
  TranslateModule,
  TableModule,
  ButtonModule,
  MultiSelectModule,
  NgxPermissionsModule,
];
const sharedComponents: any[] = [
  EbtikarInputComponent,
  SubmitButtonComponent,
  ConfirmModalComponent,
  EbtikarSelectComponent,
  FileUploadComponent,
  AppArrowFocusDirective,
  ScriptsInitComponent,
  FormatValuePipe,
  TableColumnDataPipe,
];

@NgModule({
  declarations: [sharedComponents],
  imports: [CommonModule, sharedModules],
  exports: [CommonModule, sharedModules, sharedComponents],
})
export class SharedModule {}
