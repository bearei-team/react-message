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
export interface MessageOptions<E = unknown> extends Pick<BaseMessageProps, 'visible'> {
  /**
   * Triggers an event when a message option changes
   */
  event?: E;
}

/**
 * Base message props
 */
export interface BaseMessageProps<T = HTMLElement>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps,
    'title' | 'onClick' | 'onTouchEnd' | 'onPress' | 'type'
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Message visible state
   */
  visible?: boolean;

  /**
   * The default visible state for the message
   */
  defaultVisible?: boolean;

  /**
   * Message display duration
   */
  duration?: number;

  /**
   * Message content
   */
  content?: ReactNode;

  /**
   * Message type
   */
  type?: 'normal' | 'success' | 'warning' | 'error';

  /**
   * Message close icon
   */
  closeIcon?: ReactNode;

  /**
   * Whether the message close button icon is visible
   */
  closeIconVisible?: boolean;

  /**
   * This function is called when the message visible state changes
   */
  onVisible?: <E>(options: MessageOptions<E>) => void;

  /**
   * This function is called when the message is closed
   */
  onClose?: <E>(options: MessageOptions<E>) => void;

  /**
   * This function is called when message is clicked
   */
  onClick?: (e: React.MouseEvent<T, MouseEvent>) => void;

  /**
   * This function is called when the message is pressed
   */
  onTouchEnd?: (e: TouchEvent<T>) => void;

  /**
   * This function is called when the message is pressed -- react native
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
  renderMain: (props: MessageMainProps<T>) => ReactNode;

  /**
   * Render the message container
   */
  renderContainer: (props: MessageContainerProps) => ReactNode;
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

export type MessageMainProps<T> = MessageChildrenProps & Pick<BaseMessageProps<T>, 'ref'>;
export type MessageContainerProps = MessageChildrenProps;

const Message = <T extends HTMLElement>(props: MessageProps<T>) => {
  const {
    ref,
    visible,
    defaultVisible,
    duration,
    onClick,
    onPress,
    onClose,
    onVisible,
    onTouchEnd,
    renderMain,
    renderContainer,
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
        const isUpdate = currentOptions.visible !== nextVisible && status === 'succeeded';
        const nextOptions = {visible: nextVisible};

        isUpdate && handleMessageOptionsChange(nextOptions);

        return nextOptions;
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleMessageOptionsChange, status, visible]);

  useEffect(() => {
    messageOptions.visible &&
      status === 'succeeded' &&
      (timerRef.current = setTimeout(() => handleResponse({type: 'NodeJS.Timeout'}), duration));

    return () => clearTimer();
  }, [duration, handleResponse, messageOptions.visible, status]);

  const main = renderMain({...childrenProps, ref, ...bindEvents(events, handleCallback)});
  const container = renderContainer({...childrenProps, children: main});

  return <>{container}</>;
};

export default Message;
