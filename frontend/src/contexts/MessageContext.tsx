import type { Message, MessageAction, MessageState } from "../types/message";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

/* ---------- reducer ---------- */
const messageReducer = (
  state: MessageState,
  action: MessageAction
): MessageState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { messages: [...state.messages, action.payload] };

    case "REMOVE_MESSAGE":
      return {
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    case "CLEAR_ALL_MESSAGES":
      return { messages: [] };

    case "REPLACE_ALL_MESSAGES":
      return { messages: [action.payload] };

    default:
      return state;
  }
};

/* ---------- context ---------- */
const MessageContext = createContext<
  | {
      messages: Message[];
      showMessage: (message: Omit<Message, "id">) => void;
      removeMessage: (id: string) => void;
      clearMessages: () => void;
      showError: (text: string, duration?: number) => void;
      showSuccess: (text: string, duration?: number) => void;
    }
  | undefined
>(undefined);

/* ---------- provider ---------- */
export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(messageReducer, { messages: [] });

  const showMessage = useCallback((msg: Omit<Message, "id">) => {
    const fullMsg: Message = { ...msg, id: uuidv4() };
    dispatch({ type: "REPLACE_ALL_MESSAGES", payload: fullMsg });

    if (fullMsg.duration && fullMsg.duration > 0) {
      setTimeout(
        () => dispatch({ type: "REMOVE_MESSAGE", payload: fullMsg.id }),
        fullMsg.duration
      );
    }
  }, []);

  const removeMessage = useCallback(
    (id: string) => dispatch({ type: "REMOVE_MESSAGE", payload: id }),
    []
  );

  const clearMessages = useCallback(
    () => dispatch({ type: "CLEAR_ALL_MESSAGES" }),
    []
  );

  const showError = useCallback(
    (text: string, duration = 5000) =>
      showMessage({ type: "error", text, duration }),
    [showMessage]
  );

  const showSuccess = useCallback(
    (text: string, duration = 3000) =>
      showMessage({ type: "success", text, duration }),
    [showMessage]
  );

  return (
    <MessageContext.Provider
      value={{
        messages: state.messages,
        showMessage,
        removeMessage,
        clearMessages,
        showError,
        showSuccess,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

/* ---------- hook ---------- */
export const useMessages = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error("useMessages must be used within MessageProvider");
  }
  return ctx;
};
