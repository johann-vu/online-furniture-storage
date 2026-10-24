import { LitElement } from 'lit';

// Renders into the element itself instead of a shadow root, so the global styles
// (buttons, inputs, typography) apply. Component styles are scoped by tag name in their css file.
export class LightElement extends LitElement {
  protected override createRenderRoot() {
    return this;
  }
}
