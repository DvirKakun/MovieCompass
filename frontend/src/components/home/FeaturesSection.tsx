import { motion } from "framer-motion";
import FeatureCard from "../features/FeatureCard";
import FeaturesHeader from "../features/FeaturesHeader";
import { features } from "../../data/features";

export default function FeaturesSection() {
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
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <FeaturesHeader />

        {/* Features Grid - Z Pattern */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-32"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isReversed={feature.position === "right"}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
