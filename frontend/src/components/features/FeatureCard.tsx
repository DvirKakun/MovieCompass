import { motion } from "framer-motion";
import { CheckCircle, Star, Heart, Bookmark, User, LogOut } from "lucide-react";
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
              className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            >
              <IconComponent className="w-8 h-8 text-brand" />
            </motion.div>

            {/* Feature Demo */}
            <div className="space-y-4">
              {/* AI Recommendations Demo - Feature 1 */}
              {feature.id === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">AI Analysis</span>
                    <span className="text-brand">98% Match</span>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="text-sm text-primary font-medium mb-3">
                      Recommended for you:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          title: "Banger Movie",
                          rating: 8.8,
                          poster: "/posters/banger_movie.png",
                        },
                        {
                          title: "Captain America",
                          rating: 8.6,
                          poster: "/posters/captain_america_movie.png",
                        },
                        {
                          title: "The Quite Ones",
                          rating: 8.7,
                          poster: "/posters/the_quite_ones_movie.png",
                        },
                      ].map((movie, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            delay: i * 0.3,
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                          className="bg-muted/50 rounded-lg overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors relative group"
                        >
                          {/* Movie Poster */}
                          <div className="aspect-[3/4] relative">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Rating Badge */}
                            <div className="absolute top-1 right-1">
                              <div className="bg-black/80 text-white rounded px-1.5 py-0.5 text-xs font-medium flex items-center">
                                <Star className="w-2.5 h-2.5 text-rating fill-current mr-1" />
                                {movie.rating}
                              </div>
                            </div>
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium text-center px-2">
                                {movie.title}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Browse by Categories Demo - Feature 2 */}
              {feature.id === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Active Filters</span>
                    <span className="text-brand">3 Applied</span>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border space-y-3">
                    {/* Genre Selection */}
                    <div>
                      <div className="text-xs text-secondary mb-2 font-medium">
                        Genre
                      </div>
                      <div className="bg-muted rounded-md p-2 text-sm text-foreground border border-border">
                        Sci-Fi
                      </div>
                    </div>

                    {/* Rating Range */}
                    <div>
                      <div className="text-xs text-secondary mb-2 font-medium">
                        Rating: 8.0 - 10.0
                      </div>
                      <div className="relative">
                        <div className="h-1.5 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: "80%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-secondary mt-1">
                          <span>0</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    {/* Year Range */}
                    <div>
                      <div className="text-xs text-secondary mb-2 font-medium">
                        Year: 2020 - 2024
                      </div>
                      <div className="relative">
                        <div className="h-1.5 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-secondary mt-1">
                          <span>1900</span>
                          <span>2024</span>
                        </div>
                      </div>
                    </div>

                    {/* Applied Filters */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex flex-wrap gap-1">
                        {["Sci-Fi", "Rating: 8-10", "2020-2024"].map(
                          (filter, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                            >
                              <span>{filter}</span>
                              <span className="text-primary/70 hover:text-primary cursor-pointer text-xs">
                                ×
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Management Demo - Feature 3 */}
              {feature.id === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Your Profile</span>
                    <span className="text-brand">Active</span>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border space-y-4">
                    {/* User Menu - Like Navbar Dropdown */}
                    <div className="bg-card border border-border rounded-md shadow-lg">
                      <div className="py-1">
                        {[
                          { label: "My Profile", icon: <User />, count: null },
                          {
                            label: "My Watchlist",
                            icon: <Bookmark />,
                            count: 24,
                          },
                          { label: "My Favorites", icon: <Heart />, count: 18 },
                          { label: "My Ratings", icon: <Star />, count: 47 },
                          { label: "Logout", icon: <LogOut />, count: null },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-sm">{item.icon}</span>
                              <span className="text-foreground">
                                {item.label}
                              </span>
                            </div>
                            {typeof item.count === "number" && (
                              <span className="bg-primary text-background text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                                {item.count}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Favorite Movie Card Example */}
                    <div>
                      <div className="text-xs text-secondary mb-2 font-medium">
                        Your Favorites
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <div className="flex gap-3">
                          {/* Movie Poster */}
                          <div className="relative w-16 h-24 flex-shrink-0">
                            <img
                              src="/posters/banger_movie.png"
                              alt="Banger Movie"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {/* Rating Badge */}
                            <div className="absolute top-1 right-1">
                              <div className="bg-black/80 text-white border-0 font-medium text-xs px-1.5 py-0.5 rounded flex items-center">
                                <Star className="w-2.5 h-2.5 mr-0.5 text-rating fill-current" />
                                8.8
                              </div>
                            </div>
                          </div>

                          {/* Movie Details */}
                          <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                              {/* Title and Year */}
                              <div>
                                <h4 className="font-bold text-foreground text-sm leading-tight">
                                  Banger Movie
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-secondary">
                                  <span>2023</span>
                                  <span>•</span>
                                  <span>Action, Sci-Fi</span>
                                </div>
                              </div>

                              {/* Ratings */}
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-rating fill-current" />
                                  <span className="text-foreground font-medium">
                                    8.8
                                  </span>
                                  <span className="text-secondary">
                                    (2.1k votes)
                                  </span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-primary fill-current" />
                                  <span className="text-primary font-medium">
                                    Your rating: 9/10
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-1">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-primary hover:bg-cta_hover text-background text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
                                >
                                  <span>▶</span>
                                  View Details
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="border border-primary text-primary hover:bg-primary hover:text-background text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1 transition-colors"
                                >
                                  <Star className="w-3 h-3" />
                                  Edit Rating
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
