import { motion } from "framer-motion";
import ContactMethodCard from "./ContactMethodCard";
import { contact } from "../../data/contact_info";

export default function ContactMethods() {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
    >
      {contact.map((item, index) => (
        <ContactMethodCard key={index} index={index} contact={item} />
      ))}
    </motion.div>
  );
}
