import { useState, useRef } from 'react';
import { Upload, FileCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DOCUMENT_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'passport_photo', label: 'Passport Photo' },
  { value: 'visa', label: 'Visa' },
  { value: 'air_ticket', label: 'Air Ticket' },
  { value: 'hotel_booking', label: 'Hotel Booking' },
  { value: 'other', label: 'Other Document' },
] as const;

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
const MAX_SIZE_MB = 10;

interface DocumentUploadProps {
  leadEmail: string;
  onUploadComplete?: (documentType: string, fileName: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function DocumentUpload({
  leadEmail,
  onUploadComplete,
  disabled = false,
  compact = false,
}: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState<string>('passport');
  const [uploading, setUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState<{ type: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !leadEmail?.trim() || !leadEmail.includes('@')) {
      setError('Please share your email first so we can link your document.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_SIZE_MB}MB.`);
      return;
    }

    const mime = file.type;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mime)) {
      setError('Please upload a JPEG, PNG, WebP, or PDF file.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: fnError } = await supabase.functions.invoke('voice-ai-document-upload', {
        body: {
          email: leadEmail.trim(),
          documentType,
          fileName: file.name,
          fileBase64: base64,
          mimeType: mime,
        },
      });

      if (fnError || !data?.uploaded) {
        setError(data?.error || fnError?.message || 'Upload failed. Please try again.');
        return;
      }

      setLastUpload({ type: documentType, name: file.name });
      onUploadComplete?.(documentType, file.name);
    } catch (err: any) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const typeLabel = DOCUMENT_OPTIONS.find((o) => o.value === documentType)?.label || documentType;

  if (compact) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left text-xs font-medium text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Upload size={12} />
            Upload documents
          </span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2 pt-2 border-t border-border/40">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded border border-border/60 bg-background px-2 py-1.5 text-xs"
              disabled={disabled}
            >
              {DOCUMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="flex flex-1 items-center justify-center gap-1 rounded border border-nyra/50 bg-nyra/10 px-2 py-1.5 text-xs font-medium text-nyra hover:bg-nyra/20 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={12} />
                    Choose file
                  </>
                )}
              </button>
            </div>
            {lastUpload && (
              <p className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500">
                <FileCheck size={10} />
                {lastUpload.name} uploaded
              </p>
            )}
            {error && <p className="text-[10px] text-destructive">{error}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Upload documents
      </p>
      <p className="text-[11px] text-muted-foreground">
        Nyra may ask for passport, visa, tickets, or photos. Select the type and upload.
      </p>
      <select
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        className="w-full rounded border border-border/60 bg-background px-3 py-2 text-sm"
        disabled={disabled}
      >
        {DOCUMENT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="flex w-full items-center justify-center gap-2 rounded border border-nyra/50 bg-nyra/10 px-3 py-2 text-sm font-medium text-nyra hover:bg-nyra/20 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <Upload size={16} />
            Choose file to upload
          </>
        )}
      </button>
      {lastUpload && (
        <p className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500">
          <FileCheck size={14} />
          {lastUpload.name} uploaded as {typeLabel}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
