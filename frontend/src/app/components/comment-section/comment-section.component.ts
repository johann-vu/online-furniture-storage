import { Component, Input, OnInit } from '@angular/core';
import { OfferComment } from 'src/app/model/comment';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {
  @Input() comments: OfferComment[] | undefined = [];
}
