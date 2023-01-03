# react-message

Base message components that support React and React native

## Installation

> yarn add @bearei/react-message --save

## Parameters

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| visible | `boolean` | ✘ | Message visible state |
| defaultVisible | `boolean` | ✘ | The default visible state for the message |
| duration | `number` | ✘ | Message display duration |
| content | `ReactNode` | ✘ | Message content |
| type | `normal` `success` `warning` `error` | ✘ | Message type |
| closeIcon | `ReactNode` | ✘ | Message close icon |
| closeIconVisible | `boolean` | ✘ | WWhether the message close button icon is visible |
| onVisible | `(options: MessageOptions) => void` | ✘ | This function is called when the message visible state changes |
| onClose | `(options: MessageOptions) => void` | ✘ | This function is called when the message is closed |
| onClick | `(options: React.MouseEvent) => void` | ✘ | This function is called when message is clicked |
| onTouchEnd | `(options: React.TouchEvent) => void` | ✘ | This function is called when the message is pressed |
| onPress | `(options: GestureResponderEvent) => void` | ✘ | This function is called when the message is pressed -- react native |
| renderMain | `(options: MessageMainProps) => void` | ✔ | Render the message main |
| renderContainer | `(options: MessageContainerProps) => void` | ✔ | Render the message container |

## Use

```typescript
import React from 'React';
import ReactDOM from 'react-dom';
import Message from '@bearei/react-message';

const message = (
  <Message
    renderMain={({ ...props }) => <div {...props}>"message"</div>}
    renderContainer={({ id, children }) => (
      <div data-id={id} tabIndex={1}>
        {children}
      </div>
    )}
  />
);

ReactDOM.render(message, container);
```
