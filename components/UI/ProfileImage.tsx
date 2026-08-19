"use client";
import { useState } from "react";
import Image from "next/image";
import { IMAGES, PROFILE_ALT } from "@/lib/images";

interface ProfileImageProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

function AvatarFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center select-none ${className}`}
      style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)" }}
      aria-label={PROFILE_ALT}
    >
      {/* Silhouette circle (head) */}
      <div className="w-20 h-20 rounded-full bg-blue-500/70 flex items-center justify-center mb-1">
        <span className="text-3xl font-bold text-white tracking-tight leading-none">IQ</span>
      </div>
      <span className="text-blue-300/80 text-[11px] font-medium mt-2 tracking-wide">
        Isaac L. Quelemine
      </span>

    </div>
  );
}

export default function ProfileImage({
  size = 320,
  className = "",
  priority = false,
}: ProfileImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <AvatarFallback className={className} />;
  }

  return (
    <Image
      src={IMAGES.profile}
      alt={PROFILE_ALT}
      width={size}
      height={size}
      className={`w-full h-full object-cover object-top ${className}`}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
