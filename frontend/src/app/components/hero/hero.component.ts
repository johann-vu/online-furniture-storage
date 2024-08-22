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
    path: 'assets/Smaller_Furniture.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
  };

}
