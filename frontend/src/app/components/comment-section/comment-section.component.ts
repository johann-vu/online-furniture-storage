import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OfferComment } from 'src/app/model/comment';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {
  @Input() comments: OfferComment[] | undefined = [];
  @Output() onSubmit: EventEmitter<string> = new EventEmitter();

  inputText = ""

  submit() {
    if (this.inputText == "") return
    this.onSubmit.emit(this.inputText)
    this.inputText = ""
  }
}
