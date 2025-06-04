// components/GlobalMessages.tsx
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, X, AlertTriangle, Info } from "lucide-react";
import { useMessages } from "../../contexts/MessageContext";

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  error: "bg-destructive/10 border-destructive/20 text-destructive",
  success: "bg-primary/10 border-primary/20 text-primary",
  // warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
  // info: "bg-blue-500/10 border-blue-500/20 text-blue-600",
};

export function GlobalMessages() {
  const { messages, removeMessage } = useMessages();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      <AnimatePresence>
        {messages.map((message) => {
          const Icon = iconMap[message.type];

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                colorMap[message.type]
              } shadow-lg`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm font-medium">{message.text}</p>
              <button
                onClick={() => removeMessage(message.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
