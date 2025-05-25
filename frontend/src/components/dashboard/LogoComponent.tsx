import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../contexts/MoviesContext";

export default function LogoComponent() {
  const navigate = useNavigate();
  const { clearSearch } = useMovies();

  const handleBackToDashboard = () => {
    clearSearch();
    navigate("/dashboard");
  };

  return (
    <motion.div
      className="flex items-center cursor-pointer"
      onClick={handleBackToDashboard}
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
