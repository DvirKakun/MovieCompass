import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  gradient: string;
  position: "left" | "right";
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isReversed: boolean;
}

export default function FeatureCard({
  feature,
  index,
  isReversed,
}: FeatureCardProps) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: isReversed ? 50 : -50,
      y: 30,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.2,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: isReversed ? -50 : 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: index * 0.2 + 0.3,
      },
    },
  };

  const IconComponent = feature.icon;

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
        isReversed ? "lg:grid-flow-col-dense" : ""
      }`}
    >
      {/* Content Side */}
      <motion.div
        variants={cardVariants}
        className={`space-y-6 ${isReversed ? "lg:col-start-2" : ""}`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="inline-flex items-center gap-3 bg-card rounded-full px-4 py-2 border border-border"
        >
          <IconComponent className="w-5 h-5 text-brand" />
          <span className="text-sm font-medium text-secondary">
            Feature {feature.id}
          </span>
        </motion.div>

        <h3 className="text-3xl md:text-4xl font-heading font-bold text-primary">
          {feature.title}
        </h3>

        <p className="text-lg text-secondary leading-relaxed">
          {feature.description}
        </p>

        <div className="space-y-3">
          {feature.benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 + i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-brand flex-shrink-0" />
              <span className="text-secondary">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Visual Side */}
      <motion.div
        variants={imageVariants}
        className={`relative ${isReversed ? "lg:col-start-1" : ""}`}
      >
        <div className="relative">
          {/* Background Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-3xl scale-110 opacity-50`}
          ></div>

          {/* Main Card */}
          <motion.div
            whileHover={{ y: -10, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative bg-card rounded-2xl p-8 border border-border shadow-2xl backdrop-blur-sm"
          >
            {/* Feature Icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            >
              <IconComponent className="w-8 h-8 text-brand" />
            </motion.div>

            {/* Feature Demo */}
            <div className="space-y-4">
              {/* Demo Content Based on Feature */}
              {feature.id === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">AI Analysis</span>
                    <span className="text-brand">98% Match</span>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-sm text-primary font-medium mb-2">
                      Recommended for you:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "/posters/banger_movie.png",
                        "/posters/the_quite_ones_movie.png",
                        "/posters/captain_america_movie.png",
                      ].map((posterSrc, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{
                            delay: i * 0.2,
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                          className="aspect-square bg-muted rounded overflow-hidden flex items-center justify-center"
                        >
                          <img
                            src={posterSrc}
                            alt={`Movie poster ${i + 1}`}
                            className="w-full h-full object-fill"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {feature.id === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Download Status</span>
                    <span className="text-brand">Verified ✓</span>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-primary">
                        Quality Options:
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { quality: "1080p", sizeGB: 2.5 },
                        { quality: "720p", sizeGB: 1.5 },
                        { quality: "480p", sizeGB: 0.9 },
                      ].map((details, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="flex justify-between items-center p-2 bg-muted rounded cursor-pointer hover:bg-brand/10"
                        >
                          <span className="text-sm text-secondary">
                            {details.quality}
                          </span>
                          <span className="text-xs text-brand">
                            {details.sizeGB}GB
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {feature.id === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Active Filters</span>
                    <span className="text-brand">5 Applied</span>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {["Action", "Sci-Fi", "2024", "IMDb 8+", "English"].map(
                        (filter, i) => (
                          <motion.span
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className="px-2 py-1 bg-brand/20 text-brand rounded-full text-xs"
                          >
                            {filter}
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {feature.id === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Your Ratings</span>
                    <span className="text-brand">147 movies</span>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="space-y-2">
                      {[
                        { movie: "Inception", rating: 5 },
                        { movie: "The Matrix", rating: 4 },
                        { movie: "Interstellar", rating: 5 },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-secondary">
                            {item.movie}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, starIndex) => (
                              <motion.span
                                key={starIndex}
                                animate={{
                                  scale:
                                    starIndex < item.rating ? [1, 1.2, 1] : 1,
                                }}
                                transition={{
                                  delay: starIndex * 0.1,
                                  duration: 0.3,
                                }}
                                className={`text-sm ${
                                  starIndex < item.rating
                                    ? "text-rating"
                                    : "text-muted"
                                }`}
                              >
                                ★
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-brand rounded-full p-2 shadow-lg"
            >
              <IconComponent className="w-4 h-4 text-background" />
            </motion.div>
          </motion.div>

          {/* Side Glow Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 -left-8 w-16 h-32 bg-gradient-to-r from-transparent via-brand/20 to-transparent blur-xl"></div>
            <div className="absolute bottom-1/4 -right-8 w-16 h-32 bg-gradient-to-l from-transparent via-rating/20 to-transparent blur-xl"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
