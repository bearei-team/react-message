import {bindEvents, handleDefaultEvent} from '@bearei/react-util/lib/event';
import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  Ref,
  TouchEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type {GestureResponderEvent, ViewProps} from 'react-native';

/**
 * Message options
 */
export interface MessageOptions<E = unknown> {
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
export interface BaseMessageProps<T = HTMLElement>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps & Pick<MessageOptions, 'visible'>,
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
  content?: ReactNode;

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
  onVisible?: <E>(options: MessageOptions<E>) => void;

  /**
   * Call this function when the message closes
   */
  onClose?: <E>(options: MessageOptions<E>) => void;

  /**
   * Call this function back when you click the message
   */
  onClick?: (e: React.MouseEvent<T, MouseEvent>) => void;

  /**
   * Call this function after pressing the message
   */
  onTouchEnd?: (e: TouchEvent<T>) => void;

  /**
   * Call this function after pressing the message -- react native
   */
  onPress?: (e: GestureResponderEvent) => void;
}

/**
 * Message props
 */
export interface MessageProps<T> extends BaseMessageProps<T> {
  /**
   * Render the message main
   */
  renderMain?: (props: MessageMainProps) => ReactNode;

  /**
   * Render the message container
   */
  renderContainer?: (props: MessageContainerProps<T>) => ReactNode;
}

/**
 * Message children props
 */
export interface MessageChildrenProps extends Omit<BaseMessageProps, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;
}

export type MessageMainProps = MessageChildrenProps;
export type MessageContainerProps<T> = MessageChildrenProps & Pick<BaseMessageProps<T>, 'ref'>;

const Message = <T extends HTMLElement>(props: MessageProps<T>) => {
  const {
    ref,
    visible,
    defaultVisible,
    duration,
    onVisible,
    onClose,
    renderMain,
    renderContainer,
    onClick,
    onPress,
    onTouchEnd,
    ...args
  } = props;

  const id = useId();
  const events = Object.keys(props).filter(key => key.startsWith('on'));
  const [status, setStatus] = useState('idle');
  const timerRef = useRef<NodeJS.Timeout>();
  const [messageOptions, setMessageOptions] = useState<MessageOptions>({visible: false});
  const childrenProps = {
    ...args,
    id,
    visible,
    defaultVisible,
  };

  const handleMessageOptionsChange = useCallback(
    <E,>(options: MessageOptions<E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  const clearTimer = () => timerRef.current && clearInterval(timerRef.current);
  const handleResponse = useCallback(
    <E,>(e: E, callback?: (e: E) => void) => {
      clearTimer();

      const nextVisible = !messageOptions.visible;
      const options = {event: e, visible: nextVisible};

      setMessageOptions(options);
      handleMessageOptionsChange(options);
      callback?.(e);
    },
    [handleMessageOptionsChange, messageOptions.visible],
  );

  const handleCallback = (key: string) => {
    const event = {
      onClick: handleDefaultEvent((e: React.MouseEvent<T, MouseEvent>) =>
        handleResponse(e, onClick),
      ),
      onTouchEnd: handleDefaultEvent((e: TouchEvent<T>) => handleResponse(e, onTouchEnd)),
      onPress: handleDefaultEvent((e: GestureResponderEvent) => handleResponse(e, onPress)),
    };

    return event[key as keyof typeof event];
  };

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    typeof nextVisible === 'boolean' &&
      setMessageOptions(currentOptions => {
        const update = currentOptions.visible !== nextVisible && status === 'succeeded';
        const nextOptions = {visible: nextVisible};

        update && handleMessageOptionsChange(nextOptions);

        return nextOptions;
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleMessageOptionsChange, status, visible]);

  useEffect(() => {
    if (messageOptions.visible && status === 'succeeded') {
      timerRef.current = setTimeout(() => handleResponse({type: 'NodeJS.Timeout'}), duration);
    }

    return () => clearTimer();
  }, [duration, handleResponse, messageOptions.visible, status]);

  const main = renderMain?.({...childrenProps, ...bindEvents(events, handleCallback)});
  const content = <>{main}</>;
  const container = renderContainer?.({
    ...childrenProps,
    children: content,
    ref,
  });

  return <>{container}</>;
};

export default Message;
