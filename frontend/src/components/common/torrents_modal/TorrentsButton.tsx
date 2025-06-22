import { Button } from "@/components/ui/button";
import { Movie } from "@/types/movies";
import { Download } from "lucide-react";
import { useState } from "react";
import TorrentsModal from "./TorrentsModal";

export function TorrentsButton({ movie }: { movie: Movie }) {
  const [showTorrentsModal, setShowTorrentsModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center border-orange-500 text-orange-500 hover:bg-orange-500/10"
        onClick={() => setShowTorrentsModal(true)}
      >
        <Download className="w-4 h-4 mr-1" />
        Torrents
      </Button>

      <TorrentsModal
        movie={movie}
        isOpen={showTorrentsModal}
        onClose={() => setShowTorrentsModal(false)}
      />
    </>
  );
}
