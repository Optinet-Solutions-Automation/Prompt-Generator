import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LikedImageCard } from './LikedImageCard';
import { LikedImageViewModal } from './LikedImageViewModal';

interface AirtableRecord {
  id: string;
  fields: {
    record_id?: string;
    img_url?: string;
  };
}

interface LikedImagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LikedImagesPanel({ isOpen, onClose }: LikedImagesPanelProps) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<{ imgUrl: string; recordId: string } | null>(null);

  const fetchLikedImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
      const pat = import.meta.env.VITE_AIRTABLE_PAT;

      if (!baseId || !tableName || !pat) {
        throw new Error('Airtable configuration missing');
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching liked images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load liked images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchLikedImages();
  }, [isOpen, fetchLikedImages]);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !viewImage) onClose();
  }, [onClose, viewImage]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleEsc]);

  const handleDownload = async (imgUrl: string, recordId: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = recordId || `liked-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  const validRecords = records.filter(r => r.fields.img_url);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        style={{ zIndex: 998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Liked Images"
        className="fixed right-5 flex flex-col bg-card rounded-xl border border-border animate-slide-in-right
          max-sm:inset-0 max-sm:right-0 max-sm:rounded-none max-sm:w-full max-sm:h-full
          sm:w-[450px] md:w-[550px]"
        style={{
          zIndex: 999,
          top: 'max(5vh, 20px)',
          height: 'min(90vh, calc(100vh - 40px))',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card rounded-t-xl sticky top-0 z-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Liked Images</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Loading liked images...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <AlertTriangle className="w-16 h-16 text-destructive/60" />
              <p className="text-sm font-medium text-foreground">Failed to load liked images</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchLikedImages}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && validRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Heart className="w-16 h-16 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">No liked images yet</p>
              <p className="text-xs">Start liking images to see them here!</p>
            </div>
          )}

          {!loading && !error && validRecords.length > 0 && (
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2 justify-items-center">
              {validRecords.map((record) => (
                <LikedImageCard
                  key={record.id}
                  imgUrl={record.fields.img_url!}
                  recordId={record.fields.record_id || record.id}
                  onView={() =>
                    setViewImage({
                      imgUrl: record.fields.img_url!,
                      recordId: record.fields.record_id || record.id,
                    })
                  }
                  onDownload={() =>
                    handleDownload(record.fields.img_url!, record.fields.record_id || record.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-size view modal */}
      {viewImage && (
        <LikedImageViewModal
          isOpen={!!viewImage}
          onClose={() => setViewImage(null)}
          imgUrl={viewImage.imgUrl}
          recordId={viewImage.recordId}
        />
      )}
    </>
  );
}
