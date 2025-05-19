import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function ContactHeader() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-20"
    >
      <motion.div
        variants={itemVariants}
        className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-4 py-2 mb-6"
      >
        <MessageCircle className="w-4 h-4 text-brand" />
        <span className="text-brand text-sm font-medium">Contact Us</span>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6"
      >
        Let's Start a<span className="text-brand block">Conversation</span>
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed"
      >
        Whether you have questions, feedback, or just want to say hello, we're
        here to help. Your input helps us make MovieCompass better for everyone.
      </motion.p>
    </motion.div>
  );
}
