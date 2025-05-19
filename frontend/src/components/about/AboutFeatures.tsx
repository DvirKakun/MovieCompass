import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { features } from "../../data/about_features";

export default function AboutFeatures() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
    >
      {features.map((feature, index) => {
        const IconComponent = feature.icon;

        return (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="h-full bg-card border-border hover:border-brand/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/30 transition-colors">
                    <IconComponent className="w-6 h-6 text-brand" />
                  </div>
                  <h4 className="text-xl font-semibold text-primary">
                    {feature.title}
                  </h4>
                  <p className="text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
