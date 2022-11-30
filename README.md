# react-message

Base message components that support React and React native

## Installation

> yarn add @bearei/react-message --save

## Parameters

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| defaultVisible | `boolean` | ✘ | Set the default visible state of the message |
| duration | `number` | ✘ | Set the message display duration |
| content | `ReactNode` | ✘ | The contents of the message prompt |
| type | `normal` `success` `warning` `error` | ✘ | Message type |
| closeIcon | `ReactNode` | ✘ | Set the icon to close |
| closeIconVisible | `boolean` | ✘ | Whether to display the close icon |
| onVisible | `(options: MessageOptions) => void` | ✘ | Call back this function when the message visible state changes |
| onClose | `(options: MessageOptions) => void` | ✘ | Call this function when the message closes |
| renderMain | `(options: MessageMainProps) => void` | ✘ | Render the message main |
| renderContainer | `(options: MessageContainerProps) => void` | ✘ | Render the message container |

## Use

```typescript
import React from 'React';
import ReactDOM from 'react-dom';
import Message from '@bearei/react-message';

const message = (
  <Message<HTMLDivElement>
    renderMain={({...props}) => (
      <div {...pickHTMLAttributes(props)} data-cy="message">
        "message"
      </div>
    )}
    renderContainer={({id, children}) => (
      <div data-cy="container" data-id={id} tabIndex={1}>
        {children}
      </div>
    )}
  />
);

ReactDOM.render(message, container);
```
