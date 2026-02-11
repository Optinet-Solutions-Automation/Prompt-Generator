import { Heart, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikedImageCardProps {
  imgUrl: string;
  recordId: string;
  onView: () => void;
  onDownload: () => void;
}

export function LikedImageCard({ imgUrl, recordId, onView, onDownload }: LikedImageCardProps) {
  return (
    <div className="relative group w-[180px] h-[180px] max-sm:w-[120px] max-sm:h-[120px] rounded-xl overflow-hidden border border-border shadow-sm">
      <img
        src={imgUrl}
        alt={recordId}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Overlay buttons - always visible */}
      <div className="absolute top-2 left-2 flex gap-1.5 z-10">
        {/* Heart indicator */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shadow-md',
            'bg-red-500'
          )}
          aria-label="Liked"
        >
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        {/* Download */}
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-primary hover:scale-110 transition-transform cursor-pointer"
          aria-label="Download image"
        >
          <Download className="w-4 h-4 text-primary-foreground" />
        </button>
        {/* View */}
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-primary hover:scale-110 transition-transform cursor-pointer"
          aria-label="View full size"
        >
          <Eye className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
