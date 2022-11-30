import {DefaultEvent} from '@bearei/react-util';
import type {HandleEvent} from '@bearei/react-util/lib/event';
import handleEvent from '@bearei/react-util/lib/event';
import {DetailedHTMLProps, HTMLAttributes, ReactNode, Ref, TouchEvent, useRef} from 'react';
import {useId, useCallback, useEffect, useState} from 'react';
import type {GestureResponderEvent, ViewProps} from 'react-native';

/**
 * Message options
 */
export interface MessageOptions<E> {
  /**
   * Message the visible status
   */
  visible?: boolean;

  /**
   * Event that triggers a message visible state change
   */
  event?: E;
}

/**
 * Base message props
 */
export interface BaseMessageProps<T, E>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps & Pick<MessageOptions<E>, 'visible'>,
    'title' | 'onClick' | 'onTouchEnd' | 'onPress' | 'type'
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Set the default visible state of the message
   */
  defaultVisible?: boolean;

  /**
   * Set the message display duration
   */
  duration?: number;

  /**
   * The contents of the message prompt
   */
  message?: ReactNode;

  /**
   * Message type
   */
  type?: 'normal' | 'success' | 'warning' | 'error';

  /**
   * Set the icon to close
   */
  closeIcon?: ReactNode;

  /**
   * Whether to display the close icon
   */
  closeIconVisible?: boolean;

  /**
   * Call back this function when the message visible state changes
   */
  onVisible?: (options: MessageOptions<E>) => void;

  /**
   * Call this function when the message closes
   */
  onClose?: (options: MessageOptions<E>) => void;
}

/**
 * Message props
 */
export interface MessageProps<T, E> extends BaseMessageProps<T, E> {
  /**
   *  Message binding event name
   */
  event?: 'onClick' | 'onTouchEnd' | 'onPress';

  /**
   * Render the message main
   */
  renderMain?: (props: MessageMainProps<T, E>) => ReactNode;

  /**
   * Render the message container
   */
  renderContainer?: (props: MessageContainerProps<T, E>) => ReactNode;
}

/**
 * Message children props
 */
export interface MessageChildrenProps<T, E> extends Omit<BaseMessageProps<T, E>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;

  /**
   * Call this function back when you click the message
   */
  onClick?: (e: MessageClickEvent<T>) => void;

  /**
   * Call this function after pressing the message
   */
  onTouchEnd?: (e: MessageTouchEvent<T>) => void;

  /**
   * Call this function after pressing the message -- react native
   */
  onPress?: (e: MessagePressEvent) => void;

  /**
   * Used to handle some common default events
   */
  handleEvent: HandleEvent;
}

export type MessageClickEvent<T> = React.MouseEvent<T, MouseEvent>;
export type MessageTouchEvent<T> = TouchEvent<T>;
export type MessagePressEvent = GestureResponderEvent;

export type MessageHeaderProps<T, E> = MessageChildrenProps<T, E>;
export type MessageMainProps<T, E> = MessageChildrenProps<T, E>;
export type MessageFooterProps<T, E> = MessageChildrenProps<T, E>;
export type MessageContainerProps<T, E> = MessageChildrenProps<T, E> &
  Pick<BaseMessageProps<T, E>, 'ref'>;

function Message<T, E = MessageClickEvent<T>>({
  ref,
  event,
  visible,
  defaultVisible,
  duration,
  onVisible,
  onClose,
  renderMain,
  renderContainer,
  ...props
}: MessageProps<T, E>) {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const timerRef = useRef<NodeJS.Timeout>();
  const [messageOptions, setMessageOptions] = useState<MessageOptions<E>>({visible: false});
  const childrenProps = {
    ...props,
    id,
    visible,
    defaultVisible,
    handleEvent,
  };

  const handleMessageOptionsChange = useCallback(
    (options: MessageOptions<E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  const clearTimer = () => timerRef.current && clearInterval(timerRef.current);
  const handleCallback = (e: E & DefaultEvent) => {
    clearTimer();

    const nextVisible = !messageOptions.visible;
    const options = {event: e, visible: nextVisible};

    setMessageOptions(options);
    handleMessageOptionsChange(options);
  };

  const bindEvent = () => (event ? {[event]: handleEvent(handleCallback)} : undefined);

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    typeof nextVisible === 'boolean' &&
      setMessageOptions(currentOptions => {
        const change = currentOptions.visible !== nextVisible && status === 'succeeded';
        const nextOptions = {visible: nextVisible};

        if (change) {
          handleMessageOptionsChange(nextOptions);

          nextVisible &&
            duration &&
            (timerRef.current = setTimeout(
              () => handleMessageOptionsChange(nextOptions),
              duration,
            ));
        }

        return nextOptions;
      });

    status === 'idle' && setStatus('succeeded');

    return () => clearTimer();
  }, [defaultVisible, duration, handleMessageOptionsChange, status, visible]);

  const main = renderMain?.({...childrenProps, ...bindEvent()});
  const content = <>{main}</>;
  const container =
    renderContainer?.({
      ...childrenProps,
      children: content,
      ref,
    }) ?? content;

  return <>{container}</>;
}

export default Message;
