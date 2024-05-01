import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @Input() label?: string;
  @Input() filePath?: string;
  selectedFile: File;

  @ViewChild('filesInput', { static: false }) filesInput: any;

  @Output() changed = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  uploadFiles(ev: any): void {
    const file: File = ev.target.files[0];
    if (!file) {
      return;
    }
    if (file) {
      this.selectedFile = file;
      this.changed.emit(file);
    }
  }
}
