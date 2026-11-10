"use client";

import { Play } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function FeaturedVideo() {
  const { settings } = useSettings();
  const video = settings?.featuredVideo;

  if (!video?.url) return null;

  return (
    <section id="video" className="section-padding bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">Featured Video</span>
          <h2 className="section-title">{video.title || 'Watch My Latest Work'}</h2>
          {video.description && <p className="text-slate-600 mt-3">{video.description}</p>}
        </div>
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-slate-900/10">
          <video controls preload="metadata" className="w-full aspect-video" aria-label={video.title || 'Featured video'}>
            <source src={video.url} />
            Your browser does not support video playback.
          </video>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-4">
          <Play size={15} aria-hidden="true" />
          <span>Use the controls to play the video.</span>
        </div>
      </div>
    </section>
  );
}
