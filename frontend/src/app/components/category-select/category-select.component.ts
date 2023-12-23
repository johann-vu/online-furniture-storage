import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectComponent),
      multi: true
    }
  ]
})
export class CategorySelectComponent implements ControlValueAccessor {

  @Input() options: { value: any; label: string }[] = [];

  selectedValue: any;

  // Function to call when the value changes (required by ControlValueAccessor)
  onChange: any = () => {};

  // Function to call when the input is touched (required by ControlValueAccessor)
  onTouched: any = () => {};

  // Write value from the model into the view (required by ControlValueAccessor)
  writeValue(value: any): void {
    this.selectedValue = value;
  }

  // Register a function to be called when the model changes (required by ControlValueAccessor)
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register a function to be called when the input is touched (required by ControlValueAccessor)
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Set the disabled state of the control (required by ControlValueAccessor)
  setDisabledState?(isDisabled: boolean): void {
    // You can implement this if you want to handle disabling of the control
  }

}
