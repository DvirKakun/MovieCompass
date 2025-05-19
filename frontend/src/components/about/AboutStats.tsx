import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { stats } from "../../data/about_stats";

export default function AboutStats() {
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

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
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
      className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
    >
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <motion.div
            key={index}
            variants={statsVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(33, 208, 122, 0.1)",
            }}
            className="group"
          >
            <Card className="bg-card border-border hover:border-brand/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-primary/30 transition-colors"
                >
                  <IconComponent className="w-6 h-6 text-brand" />
                </motion.div>
                <div className="text-3xl font-bold text-brand mb-2">
                  {stat.value}
                </div>
                <div className="text-primary font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-secondary">{stat.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
