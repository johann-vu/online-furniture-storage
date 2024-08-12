import { Component, Input } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  @Input() imageSrc: string | undefined
  @Input() lottieSrc: string | undefined

  lottieConfig: AnimationOptions = {
    path: 'assets/Smaller_Furniture.json', // Der Pfad zu deiner JSON-Datei
    renderer: 'svg', // Anderer Renderer können sein: 'canvas', 'html'
    loop: true,
    autoplay: true,
  };

}
