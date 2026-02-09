import { useEffect, useRef } from "react";
import {
  FlatList,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from "react-native";

export function useChatAutoScroll<T>() {
  const listRef = useRef<FlatList<T>>(null);
  const isAtBottomRef = useRef(true);
  // const didInitialScrollRef = useRef(false);
  const scrollLockRef = useRef(false);

  // --- core smooth scroll ---
  const smoothScrollToBottom = () => {
    if (!isAtBottomRef.current) return;
    if (scrollLockRef.current) return;

    scrollLockRef.current = true;

    requestAnimationFrame(() => {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });

        // unlock after animation settles
        setTimeout(() => {
          scrollLockRef.current = false;
        }, 120);
      }, 16); // ~1 frame
    });
  };

  // --- force scroll (initial open only) ---
  const forceScrollToBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });
  };

  // --- detect if user is at bottom ---
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const padding = 30;

    isAtBottomRef.current =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - padding;
  };

  // --- keyboard show / hide ---
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardChange = () => {
      smoothScrollToBottom();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardChange);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardChange);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- initial open ---
  const handleContentSizeChange = () => {
    // if (didInitialScrollRef.current) return;

    // didInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });
  };

  return {
    listRef,
    handleScroll,
    handleContentSizeChange,
    smoothScrollToBottom,
    forceScrollToBottom,
  };
}
