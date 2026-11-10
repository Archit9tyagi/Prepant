import React from 'react';
import { cn } from '../../lib/utils.js';

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  url,
  title = 'Mentor video presentation',
  className,
}) => {
  const getEmbedUrl = (rawUrl: string): string => {
    try {
      if (rawUrl.includes('youtube.com/watch')) {
        const id = new URL(rawUrl).searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (rawUrl.includes('vimeo.com/')) {
        const id = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
      }
    } catch {
      return rawUrl;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[16px] bg-slate-950 aspect-video shadow-md',
        className,
      )}
    >
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
};
