import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export default function AboutTMDBIntegration() {
  return (
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
                  <div className="text-lg font-bold text-rating">24/7</div>
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
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
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
  );
}
