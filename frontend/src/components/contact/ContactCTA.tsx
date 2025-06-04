import { motion } from "framer-motion";
import { Mail, ArrowRight, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface ContactCTAProps {
  title?: string;
  description?: string;
  email?: string;
  className?: string;
}

export default function ContactCTA({
  title = "Get in Touch",
  description = "Have questions, suggestions, or feedback? We'd love to hear from you!",
  email = "moviecompassservice@gmail.com",
  className = "",
}: ContactCTAProps) {
  const handleContactClick = () => {
    const subject = encodeURIComponent("MovieCompass Inquiry");
    const body = encodeURIComponent(
      "Hello MovieCompass team,\n\nI'm interested in learning more about your platform.\n\nBest regards,"
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  const handleEmailClick = () => {
    navigator.clipboard.writeText(email);
    // You could add a toast notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`text-center ${className}`}
    >
      <Card className="bg-gradient-to-br from-card via-card to-muted border-border shadow-2xl max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Animated Mail Icon */}
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto group"
            >
              <Mail className="w-8 h-8 text-primary group-hover:text-primary" />
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {title}
              </h3>
              <p className="text-secondary">{description}</p>

              {/* Email Display */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleEmailClick}
                className="bg-background rounded-lg p-4 border border-border cursor-pointer hover:border-primary/30 transition-colors group"
              >
                <div className="text-brand font-medium group-hover:text-brand text-lg">
                  {email}
                </div>
                <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to copy
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleContactClick}
                  className="bg-primary text-background hover:bg-cta_hover transition-colors group w-full sm:w-auto"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={handleEmailClick}
                  className="border-primary text-brand hover:bg-primary hover:text-background transition-colors w-full sm:w-auto"
                  size="lg"
                >
                  Copy Email
                </Button>
              </motion.div>
            </div>

            {/* Additional Contact Info */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
