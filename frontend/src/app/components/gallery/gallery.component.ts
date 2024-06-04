import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import Viewer from 'viewerjs';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
	@Input() image_urls: string[] = [];
	@ViewChild('images', { static: false }) imagesElement: ElementRef | undefined;
	gallery: Viewer | undefined

	openImage(id: number) {
		if (this.imagesElement && !this.gallery) {
		  this.gallery = new Viewer(this.imagesElement.nativeElement, {
			toolbar: 3, url(image: { src: string; }) {
			  const urlObj = new URL(image.src);
			  const searchParams = new URLSearchParams(urlObj.search);
			  searchParams.delete('thumb');
			  urlObj.search = searchParams.toString();
			  return urlObj.toString();
			}
		  })
		}
		this.gallery?.moveTo(id)
	  }
}
