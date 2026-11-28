import { Heart } from "lucide-react";
import { useFavorite } from "@/lib/favorites";

// Heart button — click to add/remove a listing from favorites. Phase 1 uses
// localStorage; Phase 2 will layer Supabase sync on top for signed-in users
// without changing this component's API.
//
// Two visual sizes:
//   size="sm" — for listing card corners (compact, 32×32)
//   size="lg" — for the listing detail page hero (larger, more prominent)

type Props = {
  listingId: number;
  size?: "sm" | "lg";
  /** When true, positions itself absolutely in the top-right of its parent
   *  (parent must be relative). Useful for overlaying on listing card images. */
  overlay?: boolean;
  className?: string;
};

export function FavoriteButton({
  listingId,
  size = "sm",
  overlay = false,
  className,
}: Props) {
  const { isFavorited, toggle } = useFavorite(listingId);

  // Mobile gets a larger tap target (44×44 min per iOS/Android guidelines).
  // Desktop keeps the tighter visual for the smaller/lg presets.
  const dimensions =
    size === "lg"
      ? "w-11 h-11"
      : "w-11 h-11 md:w-9 md:h-9";
  const iconSize = size === "lg" ? "w-5 h-5" : "w-5 h-5 md:w-4 md:h-4";

  const positioning = overlay
    ? "absolute top-3 end-3 z-30" // end: top-right in English, top-left in Arabic (badges sit on the start side)
    : "";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop propagation so a heart click on a listing card doesn't also
    // navigate to the detail page or trigger the outer wrapper's onClick.
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={(e) => {
        // Some parent wrappers use pointerDown to navigate — swallow it
        // early so the heart always wins.
        e.stopPropagation();
      }}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={isFavorited}
      className={`${positioning} ${dimensions} flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer ${className ?? ""}`}
    >
      <Heart
        className={`${iconSize} transition-colors ${
          isFavorited ? "text-accent fill-accent" : "text-primary/60"
        }`}
      />
    </button>
  );
}
