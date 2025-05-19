interface CinemaVideoProps {
  videoSrc: string;
  title?: string;
}

export default function CinemaVideo({
  videoSrc,
  title = "Family Movie Night",
}: CinemaVideoProps) {
  return (
    <div className="relative mt-12 lg:mt-0">
      {/* Living Room Atmosphere */}
      <div className="relative">
        {/* Ambient Room Lighting - TV Screen Glow */}
        <div className="absolute inset-0 -z-10">
          {/* TV screen glow reflecting on the room */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/25 via-primary/10 to-transparent blur-3xl scale-125"></div>

          {/* Side wall reflections from TV */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-24 h-48 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-2xl"></div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-24 h-48 bg-gradient-to-l from-transparent via-primary/20 to-transparent blur-2xl"></div>

          {/* Floor glow from TV light */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-gradient-to-t from-primary/15 to-transparent blur-xl"></div>
        </div>

        {/* TV/Screen Container */}
        <div className="relative bg-card rounded-2xl p-3 shadow-2xl border border-border">
          {/* TV Frame */}
          <div className="bg-background p-1 rounded-xl">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {/* The Family Movie Video */}
              <video
                className="w-full h-full object-cover rounded-lg"
                autoPlay
                muted
                playsInline
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* TV Screen Reflection/Shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-foreground/5 to-transparent pointer-events-none rounded-lg"></div>

              {/* TV Brand Badge */}
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-secondary font-medium">
                  MovieCompass TV
                </span>
              </div>
            </div>
          </div>

          {/* TV Stand/Base */}
          <div className="mt-2">
            <div className="w-20 h-3 bg-muted rounded-full mx-auto"></div>
            <div className="w-32 h-2 bg-card mx-auto mt-1"></div>
          </div>
        </div>

        {/* Living Room Elements */}

        {/* Family Viewing Indicators */}
        <div className="absolute -top-6 -left-8 hidden lg:block">
          <div className="bg-card rounded-lg p-3 shadow-lg border border-border animate-pulse">
            <div className="flex items-center gap-2">
              <div className="text-lg">👨‍👩‍👧‍👦</div>
              <div className="text-xs text-secondary">
                <div>Family Time</div>
                <div className="text-brand">Now Watching</div>
              </div>
            </div>
          </div>
        </div>

        {/* Room caption */}
        <div className="text-center mt-8">
          <h3 className="text-primary font-heading font-semibold text-lg">
            {title}
          </h3>
          <p className="text-secondary text-sm mt-1">
            Where families discover their next favorite movies together
          </p>
        </div>
      </div>

      {/* Subtle room shadows */}
      <div className="absolute inset-0 -z-30">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent"></div>
      </div>
    </div>
  );
}
