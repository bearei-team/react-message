import { pickHTMLAttributes } from '@bearei/react-util';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Message from '../../src/components/Message';
import { render } from '../utils/test-utils';

describe('test/components/Message.test.ts', () => {
  test('It should be a render message', async () => {
    const { getByDataCy } = render(
      <Message
        defaultVisible={true}
        renderMain={({ ...props }) => (
          <div {...pickHTMLAttributes(props)} data-cy="message">
            "message"
          </div>
        )}
        renderContainer={({ id, children }) => (
          <div data-cy="container" data-id={id} tabIndex={1}>
            {children}
          </div>
        )}
      />,
    );

    expect(getByDataCy('container')).toHaveAttribute('tabIndex');
    expect(getByDataCy('message')).toHaveTextContent('message');
  });

  test('It should be a message click', async () => {
    const user = userEvent.setup();
    let result!: boolean | undefined;

    const { getByDataCy } = render(
      <Message
        onVisible={({ visible }) => (result = visible)}
        onClick={() => {}}
        renderMain={({ onClick, ...props }) => (
          <div
            {...pickHTMLAttributes(props)}
            data-cy="message"
            onClick={onClick}
          >
            "message"
          </div>
        )}
        renderContainer={({ id, children }) => (
          <div data-cy="container" data-id={id} tabIndex={1}>
            {children}
          </div>
        )}
      />,
    );

    await user.click(getByDataCy('message'));
    expect(typeof result).toEqual('boolean');
  });
});
