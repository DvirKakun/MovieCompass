import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function AboutMission() {
  return (
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
          accurate, up-to-date information about movies from around the world.
          From the latest blockbusters to hidden indie gems, our platform
          connects you with over 500,000 titles across all genres and decades.
        </p>
        <p className="text-lg text-secondary leading-relaxed">
          Founded in 2024 by a team of passionate developers and cinephiles,
          MovieCompass was born from the desire to create the ultimate movie
          discovery platform. We believe that everyone deserves to find their
          next favorite film, regardless of their taste or preference.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-primary">Our Mission</h4>
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
  );
}
