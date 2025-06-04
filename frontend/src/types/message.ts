export interface Message {
  id: string;
  type: "error" | "success";
  text: string;
  duration?: number;
}

export interface MessageState {
  messages: Message[];
}

export type MessageAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "CLEAR_ALL_MESSAGES" }
  | { type: "REPLACE_ALL_MESSAGES"; payload: Message };
