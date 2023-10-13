import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent {
  @Input()
    requiredFileType:string = '';
  @Output() fileUploadedEvent = new EventEmitter<File | null>()

  fileName = '';
  uploadProgress:number | null = null;
  uploadSub: Subscription = new Subscription();

  constructor(private http: HttpClient) {
  }

  onFileSelected(event :any) {
      const file:File = event.target.files[0];
      if(file){
        this.fileName = file.name;
        this.fileUploadedEvent.emit(file);
      }
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.fileName = '';
    this.uploadProgress = null;
    this.uploadSub = new Subscription();
  }
}
