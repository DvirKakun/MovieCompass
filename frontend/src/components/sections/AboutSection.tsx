import { motion } from "framer-motion";
import { Database, Heart, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { stats } from "../../data/about_stats";
import { features } from "../../data/about_features";

export default function AboutSection() {
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
    <section
      id="about"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rating/5 rounded-full blur-3xl"></div>
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
            <Heart className="w-4 h-4 text-brand" />
            <span className="text-brand text-sm font-medium">
              About MovieCompass
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6"
          >
            Your Gateway to the
            <span className="text-brand block">World of Cinema</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            MovieCompass is more than just a movie platform – we're your trusted
            guide through the vast universe of entertainment, helping you
            discover, explore, and enjoy films like never before.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
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
                      className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand/30 transition-colors"
                    >
                      <IconComponent className="w-6 h-6 text-brand" />
                    </motion.div>
                    <div className="text-3xl font-bold text-brand mb-2">
                      {stat.value}
                    </div>
                    <div className="text-primary font-semibold mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-secondary">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-heading font-bold text-primary">
                Powered by The Movie Database (TMDB)
              </h3>
              <p className="text-lg text-secondary leading-relaxed">
                We leverage TMDB's comprehensive database to bring you the most
                accurate, up-to-date information about movies from around the
                world. From the latest blockbusters to hidden indie gems, our
                platform connects you with over 500,000 titles across all genres
                and decades.
              </p>
              <p className="text-lg text-secondary leading-relaxed">
                Founded in 2024 by a team of passionate developers and
                cinephiles, MovieCompass was born from the desire to create the
                ultimate movie discovery platform. We believe that everyone
                deserves to find their next favorite film, regardless of their
                taste or preference.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-primary">
                Our Mission
              </h4>
              <div className="space-y-3">
                {[
                  "Democratize movie discovery through AI-powered recommendations",
                  "Provide verified, high-quality content sources",
                  "Build a community of passionate movie enthusiasts",
                  "Make cinema accessible to everyone, everywhere",
                ].map((mission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <span className="text-secondary">{mission}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <Card className="bg-gradient-to-br from-card via-card to-muted border-border shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <motion.div
                      animate={{
                        background: [
                          "linear-gradient(45deg, #21D07A, #F5C518)",
                          "linear-gradient(45deg, #F5C518, #21D07A)",
                          "linear-gradient(45deg, #21D07A, #F5C518)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                    >
                      <Database className="w-10 h-10 text-background" />
                    </motion.div>

                    <div>
                      <h4 className="text-2xl font-heading font-bold text-primary mb-2">
                        TMDB Integration
                      </h4>
                      <p className="text-secondary">
                        Real-time data synchronization with The Movie Database
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="text-lg font-bold text-brand">Live</div>
                        <div className="text-sm text-secondary">Data Sync</div>
                      </div>
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="text-lg font-bold text-rating">
                          24/7
                        </div>
                        <div className="text-sm text-secondary">Updates</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating API Indicators */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-card rounded-lg p-3 shadow-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                  <span className="text-xs text-secondary">API Active</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 bg-card rounded-lg p-3 shadow-lg border border-border"
              >
                <div className="text-xs text-secondary">
                  <div className="font-semibold">Last Update</div>
                  <div className="text-brand">Just now</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
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
                      <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center group-hover:bg-brand/30 transition-colors">
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
      </div>
    </section>
  );
}
