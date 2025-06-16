import React from "react";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { LegalDocument, LegalDocumentType } from "../../data/legalContent";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalDocumentType | null;
  content: LegalDocument | null;
}

const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  type,
  content,
}) => {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Last updated: {content.lastUpdated}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {content.content.map((section, index) => (
            <motion.div
              key={`${type}-section-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-primary" />
                {section.section}
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at legal@movievault.com
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegalModal;
