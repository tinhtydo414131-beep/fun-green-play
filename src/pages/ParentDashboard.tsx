import { Navigation } from "@/components/Navigation";
import { ParentControls } from "@/components/ParentControls";
import { motion } from "framer-motion";

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ParentControls />
        </motion.div>
      </main>
    </div>
  );
}
