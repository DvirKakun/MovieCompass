import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

interface ContactMethodCardProps {
  contact: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    details: string;
  };
  index?: number;
}

export default function ContactMethodCard({
  contact,
  index = 0,
}: ContactMethodCardProps) {
  const IconComponent = contact.icon;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      },
    },
  };

  // Option with more hover effects
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="h-full bg-card border-border hover:border-brand-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand/10 group-hover:bg-card/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/40 group-hover:scale-110 transition-all duration-300">
              <IconComponent className="w-6 h-6 text-brand group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-primary group-hover:text-brand transition-colors">
              {contact.title}
            </h3>
            <p className="text-secondary leading-relaxed group-hover:text-primary transition-colors">
              {contact.description}
            </p>
            <p className="text-sm text-muted-foreground group-hover:text-secondary transition-colors">
              {contact.details}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
