# @lp-labs/react-inline-edit

Validated inline text editing with async save, error reporting and cancel/restore behavior. React 18+ peer only; ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-inline-edit
```

## Quick Start

```jsx
import { InlineEdit } from '@lp-labs/react-inline-edit';
export default function Example() {
  return (
    <InlineEdit
      defaultValue="Project name"
      label="Edit project name"
      validate={(value) => (value.trim() ? undefined : 'Name is required')}
      onSave={async (value, { signal }) => {
        signal.throwIfAborted();
        console.log(value);
      }}
    />
  );
}
```

## API

Props: value/defaultValue='', onChange, onSave(value,{signal}), validate(value):string|undefined, maxLength=10000, disabled, label='Edit text', placeholder='Empty', renderDisplay(value), className. Activate the display button to edit; Enter/Save validates and awaits onSave before committing. Escape/Cancel restores the committed value, aborts the signal and ignores late completion. Rejected saves keep the editor open with an alert. Controlled value requires onChange. Blur does not automatically save, avoiding accidental network writes.

## Benefits

| Area                  | Details                                                      |
| --------------------- | ------------------------------------------------------------ |
| Safe commit flow      | Validate and await save before changing the displayed value. |
| Cancelable async work | Pass a signal and ignore late results.                       |
| Accessible controls   | Expose edit, save, cancel, and error states.                 |

## Customization

| Area        | Details                                               |
| ----------- | ----------------------------------------------------- |
| Validation  | Provide synchronous validation and a text length cap. |
| Persistence | Implement async onSave and optional onChange.         |
| Display     | Customize label, placeholder, and display renderer.   |

## Security And Limits

maxLength: 1–1,048,576 UTF-16 code units. Validation is synchronous; remote validation belongs in onSave. Servers must revalidate/authorize writes and implement concurrency checks where needed. Aborting cannot undo a server write already completed. Display renderers must not inject untrusted HTML. This is a single-line text editor, not rich text, markdown or an HTML sanitizer. Browser focus/keyboard behavior requires client mount; SSR renders the display button.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
