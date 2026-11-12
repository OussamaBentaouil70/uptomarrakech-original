import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        const isFilled = star <= value;

        return (
          <button
            key={index}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            disabled={readonly}
            className={cn(
              "transition-all",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
