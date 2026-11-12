import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewAvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ReviewAvatar({ src, alt, size = "md", className }: ReviewAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconSizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (imageError || !src) {
    return (
      <div
        className={cn(
          sizeMap[size],
          "rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0",
          className,
        )}
      >
        <User className={cn("text-primary/60", iconSizeMap[size])} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      className={cn(
        sizeMap[size],
        "rounded-full object-cover shrink-0",
        className,
      )}
    />
  );
}
