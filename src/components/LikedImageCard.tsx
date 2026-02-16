import { Heart, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikedImageCardProps {
  imgUrl: string;
  recordId: string;
  onView: () => void;
  onDownload: () => void;
  onUnlike: () => void;
}

export function LikedImageCard({ imgUrl, recordId, onView, onDownload, onUnlike }: LikedImageCardProps) {
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
        {/* Heart / Unlike button */}
        <button
          onClick={(e) => { e.stopPropagation(); onUnlike(); }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all',
            'bg-red-500 hover:bg-red-600 hover:scale-105'
          )}
          title="Unlike / Remove from favorites"
        >
          <Heart className="w-4 h-4 text-white fill-white" />
        </button>
        
        {/* Download */}
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-primary hover:scale-110 transition-transform cursor-pointer"
          aria-label="Download image"
          title="Download"
        >
          <Download className="w-4 h-4 text-primary-foreground" />
        </button>
        
        {/* View */}
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-primary hover:scale-110 transition-transform cursor-pointer"
          aria-label="View full size"
          title="View full size"
        >
          <Eye className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
