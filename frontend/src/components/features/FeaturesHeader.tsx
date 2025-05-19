import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function FeaturesHeader() {
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
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
      variants={headerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-4 py-2 mb-6"
      >
        <Zap className="w-4 h-4 text-brand" />
        <span className="text-brand text-sm font-medium">
          Powerful Features
        </span>
      </motion.div>

      <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
        Everything You Need for the
        <span className="text-brand block pt-2">Perfect Movie Experience</span>
      </h2>

      <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
        Discover, download, and enjoy movies like never before with our
        comprehensive suite of tools designed for true movie enthusiasts.
      </p>
    </motion.div>
  );
}
