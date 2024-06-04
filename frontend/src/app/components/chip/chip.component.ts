import { Component, Input } from '@angular/core';

@Component({
  selector: 'chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
	@Input() text: string = "";
	@Input() color: string = "primary";
	@Input() icon: string = "";
}
