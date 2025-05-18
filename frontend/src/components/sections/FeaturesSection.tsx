import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { Star, MessageSquare, Zap } from "lucide-react";
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
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
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
            className="inline-flex items-center gap-2 bg-brand/10 rounded-full px-4 py-2 mb-6"
          >
            <Zap className="w-4 h-4 text-brand" />
            <span className="text-brand text-sm font-medium">
              Powerful Features
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
            Everything You Need for the
            <span className="text-brand block pt-2">
              Perfect Movie Experience
            </span>
          </h2>

          <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Discover, download, and enjoy movies like never before with our
            comprehensive suite of tools designed for true movie enthusiasts.
          </p>
        </motion.div>

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

        {/* Reviews Feature - Special Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="bg-gradient-to-br from-card via-card to-muted rounded-2xl p-8 md:p-12 border border-border shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-brand" />
                  <h3 className="text-3xl font-heading font-bold text-primary">
                    Community Reviews
                  </h3>
                </div>

                <p className="text-lg text-secondary leading-relaxed">
                  Read honest reviews from fellow movie lovers and share your
                  own thoughts. Our community-driven review system helps you
                  make informed decisions about what to watch next.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-brand">50K+</div>
                    <div className="text-sm text-secondary">Reviews</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-rating">4.8★</div>
                    <div className="text-sm text-secondary">Avg Rating</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-background rounded-xl p-6 border border-border shadow-xl"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-background font-bold text-lg">
                      MR
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">
                          Movie Reviewer
                        </span>
                        <div className="flex text-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-secondary text-sm">
                        "Absolutely incredible platform! The AI recommendations
                        are spot-on and I've discovered so many amazing films I
                        never would have found otherwise."
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Reviewed: The Matrix Resurrections</span>
                    <span>2 days ago</span>
                  </div>
                </motion.div>

                {/* Floating review cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-lg border border-border hidden lg:block"
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-rating fill-current" />
                    <span className="text-sm font-semibold">9.1/10</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-4 -left-4 bg-card rounded-lg p-3 shadow-lg border border-border hidden lg:block"
                >
                  <div className="text-xs text-secondary">
                    <div className="font-semibold">Latest Review</div>
                    <div className="text-brand">Just now</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
