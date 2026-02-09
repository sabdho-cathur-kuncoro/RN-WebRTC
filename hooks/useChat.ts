import {
  onGetConversationsService,
  onGetMessagesService,
} from "@/services/chat";
import {
  joinConversation,
  onNewMessage,
  sendChatMessage,
} from "@/socket/chatEvents";
import { useOperationStore } from "@/stores/operation.store";
import { storage } from "@/utils/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastAndroid } from "react-native";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";
import { useChatAutoScroll } from "./useChatAutoScroll";
import { useLoading } from "./useLoading";

type ChatMessage = {
  id: string;
  content: string;
  sender_id: string;
  username: string;
  created_at: number;
  status?: "sent" | "delivered" | "read";
};

export function useChat() {
  const operation = useOperationStore((s) => s.operation);
  const [selectedConvo, setSelectedConvo] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [listConversations, setListConversations] = useState([]);
  const [listMessages, setListMessages] = useState<ChatMessage[]>([]);

  const { smoothScrollToBottom } = useChatAutoScroll();
  const loading = useLoading();

  const selectedConvoRef = useRef(selectedConvo);

  const actions = {
    onSetSelectedConvo: useCallback((val: any) => {
      setSelectedConvo(val);
    }, []),
    onSetListMessages: useCallback(
      (val: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
        setListMessages(val);
      },
      []
    ),
    onSetMessage: useCallback((val: string) => {
      setMessage(val);
    }, []),
    onGetMessages: useCallback(async () => {
      try {
        if (!selectedConvo) {
          return;
        }
        loading.show({
          message: "Getting messages..",
          cancellable: false,
        });
        const data = await onGetMessagesService(selectedConvo?.conversation_id);
        const sortedItems = data.sort((a: any, b: any) => {
          return +new Date(a.created_at) - +new Date(b.created_at);
        });
        setListMessages(sortedItems ?? []);
      } catch (err: any) {
        if (__DEV__) {
          console.log(err?.response);
        }
      } finally {
        loading.hide();
      }
    }, [loading, selectedConvo]),
    onGetConversations: useCallback(async () => {
      try {
        loading.show({
          message: "Getting conversations..",
          cancellable: false,
        });
        const data = await onGetConversationsService();
        setListConversations(data ?? []);
      } catch (err) {
        if (__DEV__) {
          console.log(err);
        }
      } finally {
        loading.hide();
      }
    }, [loading]),
    onGetOpsConversations: useCallback(async () => {
      try {
        loading.show({
          message: "Getting messages..",
          cancellable: false,
        });
        const data = await onGetConversationsService();
        const filteredOps = data.filter(
          (d: any) => d.display_name === operation?.activity_name
        )[0];
        const msg = await onGetMessagesService(filteredOps?.conversation_id);
        const sortedItems = msg.sort((a: any, b: any) => {
          return +new Date(a.created_at) - +new Date(b.created_at);
        });
        setSelectedConvo(filteredOps);
        setListMessages(sortedItems ?? []);
      } catch (err) {
        if (__DEV__) {
          console.log(err);
        }
      } finally {
        loading.hide();
      }
    }, [loading, operation?.activity_name]),
    onHandleSendMessage: useCallback(() => {
      try {
        if (message.length === 0) {
          ToastAndroid.showWithGravity(
            "Pesan tidak boleh kosong",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
          );
          return;
        }
        const userId = storage.getString("user.id");
        const username = storage.getString("user.username");
        const content = message;
        const convoId = selectedConvo?.conversation_id;

        const clientId = uuid();
        const optimisticMessage: any = {
          clientId,
          senderId: parseInt(userId!),
          conversationId: convoId,
          username: username,
          content,
          createdAt: Date.now(),
          status: "sending",
        };
        const uiMessage: ChatMessage = {
          id: optimisticMessage.clientId,
          sender_id: optimisticMessage.senderId,
          username: optimisticMessage.username,
          content: optimisticMessage.content,
          created_at: optimisticMessage.createdAt,
          status: optimisticMessage.status,
        };
        // console.log("[SENDER]", optimisticMessage);

        setListMessages((prev: ChatMessage[]) => {
          if (prev.some((m) => m.id === uiMessage.id)) {
            return prev;
          }
          return [...prev, uiMessage];
        });
        smoothScrollToBottom();
        sendChatMessage(optimisticMessage);
      } catch (err) {
        if (__DEV__) {
          console.log(err);
        }
      } finally {
        setMessage("");
      }
    }, [smoothScrollToBottom, message, selectedConvo?.conversation_id]),
    onHandleSelectedConvo: useCallback(
      (val: any) => {
        try {
          setSelectedConvo(val);
          smoothScrollToBottom();
        } catch (err) {
          console.log(err);
        }
      },
      [smoothScrollToBottom]
    ),
  };

  const mapSocketMessageToChat = (msg: any): ChatMessage => {
    return {
      id: String(msg.id),
      content: msg.content,
      sender_id: String(msg.sender_id),
      username: msg.username,
      created_at: new Date(msg.created_at).getTime(),
      status: msg.status,
    };
  };

  // socket connection
  useEffect(() => {
    if (!selectedConvo) return;
    joinConversation(selectedConvo.conversation_id);
  }, [selectedConvo]);

  useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.conversation_id !== selectedConvoRef.current?.conversation_id) {
        return;
      }

      const uiMessage = mapSocketMessageToChat(msg);

      setListMessages((prev) => {
        if (prev.some((m) => m.id === uiMessage.id)) return prev;
        return [...prev, uiMessage];
      });

      smoothScrollToBottom();
    };

    onNewMessage(handler);
  }, [smoothScrollToBottom]);

  return {
    message,
    listConversations,
    listMessages,
    selectedConvo,
    actions,
  };
}
