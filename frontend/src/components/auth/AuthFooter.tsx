// src/components/auth/AuthFooter.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import LegalModal from "../common/LegalModal";
import { legalContent, LegalDocumentType } from "../../data/legalContent";

interface ModalState {
  isOpen: boolean;
  type: LegalDocumentType | null;
}

export const AuthFooter: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
  });

  const openModal = (type: LegalDocumentType): void => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = (): void => {
    setModalState({ isOpen: false, type: null });
  };

  const getCurrentContent = () => {
    if (!modalState.type) return null;

    return legalContent[modalState.type];
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mt-4"
      >
        <p className="text-xs text-muted-foreground leading-tight">
          By continuing, you agree to our{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-primary hover:text-primary/80 text-xs transition-colors duration-200"
            onClick={() => openModal("terms")}
            type="button"
            aria-label="View Terms of Service"
          >
            Terms of Service
          </Button>{" "}
          and{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-primary hover:text-primary/80 text-xs transition-colors duration-200"
            onClick={() => openModal("privacy")}
            type="button"
            aria-label="View Privacy Policy"
          >
            Privacy Policy
          </Button>
        </p>
      </motion.div>

      <LegalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        content={getCurrentContent()}
      />
    </>
  );
};
