import { useState, useEffect, memo } from "react";
import {
  Download,
  ExternalLink,
  Users,
  HardDrive,
  Clock,
  Search,
  AlertTriangle,
  Loader2,
  Copy,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useMovies } from "../../../contexts/MoviesContext";
import type { Movie, TorrentResult } from "../../../types/movies";

interface TorrentsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

type SortOption = "seeders" | "size" | "date" | "name";
type SortDirection = "asc" | "desc";

export default memo(function TorrentsModal({
  movie,
  isOpen,
  onClose,
}: TorrentsModalProps) {
  const { fetchTorrents, getTorrents, isTorrentsLoading, getTorrentsError } =
    useMovies();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("seeders");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [copiedMagnet, setCopiedMagnet] = useState<string | null>(null);

  const movieId = movie?.id;
  const torrents: TorrentResult[] = movieId ? getTorrents(movieId) : [];
  const isLoading = movieId ? isTorrentsLoading(movieId) : false;
  const error = movieId ? getTorrentsError(movieId) : null;

  // Fetch torrents when modal opens
  useEffect(() => {
    console.log("Torrents");
    if (isOpen && movie && torrents.length === 0) {
      fetchTorrents(movie);
    }
  }, [isOpen, movie]);

  // Get unique categories
  const categories = Array.from(
    new Set(torrents.map((t) => t.category).filter(Boolean))
  );

  // Filter and sort torrents
  const filteredTorrents = torrents
    .filter((torrent) => {
      const matchesSearch = torrent.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || torrent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "seeders":
          comparison = parseInt(a.seeders) - parseInt(b.seeders);
          break;
        case "size":
          // Basic size comparison (would need proper size parsing for accuracy)
          comparison = a.size.localeCompare(b.size);
          break;
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

  const handleCopyMagnet = async (magnetLink: string, torrentName: string) => {
    try {
      await navigator.clipboard.writeText(magnetLink);
      setCopiedMagnet(torrentName);
      setTimeout(() => setCopiedMagnet(null), 2000);
    } catch (err) {
      console.error("Failed to copy magnet link:", err);
    }
  };

  const formatFileSize = (size: string) => {
    // If size is already formatted (contains GiB, MiB), return as is
    if (size.includes("GiB") || size.includes("MiB") || size.includes("KiB")) {
      return size;
    }
    return size;
  };

  const getQualityBadgeColor = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("4k") || nameLower.includes("2160p"))
      return "bg-purple-500/20 text-purple-300";
    if (nameLower.includes("1080p")) return "bg-blue-500/20 text-blue-300";
    if (nameLower.includes("720p")) return "bg-green-500/20 text-green-300";
    if (nameLower.includes("480p")) return "bg-yellow-500/20 text-yellow-300";
    return "bg-gray-500/20 text-gray-300";
  };

  const extractQuality = (name: string) => {
    const qualityMatch = name.match(/(4K|2160p|1080p|720p|480p)/i);
    return qualityMatch ? qualityMatch[0] : null;
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Download className="w-6 h-6 text-orange-500" />
            Torrents for "{movie.title}"
          </DialogTitle>
          <DialogDescription>
            Browse and download available torrents for this movie
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 py-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search torrents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortDirection}`}
              onValueChange={(value) => {
                const [sort, direction] = value.split("-") as [
                  SortOption,
                  SortDirection
                ];
                setSortBy(sort);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeders-desc">Seeders (High)</SelectItem>
                <SelectItem value="seeders-asc">Seeders (Low)</SelectItem>
                <SelectItem value="size-desc">Size (Large)</SelectItem>
                <SelectItem value="size-asc">Size (Small)</SelectItem>
                <SelectItem value="date-desc">Date (Recent)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg text-secondary">
                  Loading torrents...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-destructive">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Failed to load torrents
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => movie && fetchTorrents(movie)}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredTorrents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Download className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No torrents found</h3>
                <p className="text-sm">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your filters"
                    : "No torrents available for this movie"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-1">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>
                    Found {filteredTorrents.length} torrent
                    {filteredTorrents.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Sorted by {sortBy} ({sortDirection}ending)
                  </span>
                </div>

                {filteredTorrents.map((torrent, index) => {
                  const quality = extractQuality(torrent.name);
                  const isCopied = copiedMagnet === torrent.name;

                  console.log(filteredTorrents);
                  return (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                              {torrent.name}
                            </h4>
                            {quality && (
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getQualityBadgeColor(
                                  torrent.name
                                )}`}
                              >
                                {quality}
                              </span>
                            )}
                            {torrent.category && (
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                {torrent.category}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              <span>{formatFileSize(torrent.size)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="text-green-500">
                                {torrent.seeders}
                              </span>
                              <span>/</span>
                              <span className="text-red-500">
                                {torrent.leechers}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{torrent.date}</span>
                            </div>
                            {torrent.downloads && (
                              <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                <span>{torrent.downloads} downloads</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                            onClick={() =>
                              window.open(torrent.magnet, "_blank")
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Magnet
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopyMagnet(torrent.magnet, torrent.name)
                            }
                            className={
                              isCopied ? "border-green-500 text-green-500" : ""
                            }
                          >
                            {isCopied ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            {isCopied ? "Copied!" : "Copy"}
                          </Button>

                          {torrent.torrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(torrent.torrent, "_blank")
                              }
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              .torrent
                            </Button>
                          )}

                          {torrent.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(torrent.url, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Padding at bottom for better scrolling experience */}
                <div className="h-4" />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
