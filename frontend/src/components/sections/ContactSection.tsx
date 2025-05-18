import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ContactCTA from "./ContactCTA";
import { contact } from "../../data/contact_info";
import { faq } from "../../data/faq_info";

export default function ContactSection() {
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
    <section
      id="contact"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-brand/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-rating/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-brand/10 rounded-full px-4 py-2 mb-6"
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
            Whether you have questions, feedback, or just want to say hello,
            we're here to help. Your input helps us make MovieCompass better for
            everyone.
          </motion.p>
        </motion.div>

        {/* Contact Methods Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {contact.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="text-center p-6 bg-card rounded-xl border border-border hover:border-brand/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-secondary mb-2">{item.description}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Contact CTA */}
        <ContactCTA
          title="Ready to Connect?"
          description="Send us a message and we'll get back to you as soon as possible. We value every piece of feedback from our community."
        />

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-heading font-bold text-primary mb-8">
            Common Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faq.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-left p-6 bg-card rounded-lg border border-border"
              >
                <h4 className="font-semibold text-primary mb-2">
                  {faq.question}
                </h4>
                <p className="text-secondary text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
