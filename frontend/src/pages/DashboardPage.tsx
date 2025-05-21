import { motion } from "framer-motion";
import Navbar from "../components/dashboard/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Welcome to MovieCompass</h1>

          {/* Dashboard content will go here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Recommended for You
              </h2>
              <p className="text-secondary">
                Your personalized movie recommendations will appear here.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
              <p className="text-secondary">
                Movies you've saved to watch later will appear here.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <p className="text-secondary">
                Your recent ratings and reviews will appear here.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
