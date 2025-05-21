import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LogoComponent() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex items-center cursor-pointer"
      onClick={() => navigate("/")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <h1 className="text-xl font-heading font-bold">
        <span className="text-primary">Movie</span>
        <span className="text-brand">Compass</span>
      </h1>
    </motion.div>
  );
}
