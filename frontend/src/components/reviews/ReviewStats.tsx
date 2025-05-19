export default function ReviewStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-background rounded-lg border border-border">
        <div className="text-2xl font-bold text-brand">50K+</div>
        <div className="text-sm text-secondary">Reviews</div>
      </div>
      <div className="text-center p-4 bg-background rounded-lg border border-border">
        <div className="text-2xl font-bold text-rating">4.8★</div>
        <div className="text-sm text-secondary">Avg Rating</div>
      </div>
    </div>
  );
}
