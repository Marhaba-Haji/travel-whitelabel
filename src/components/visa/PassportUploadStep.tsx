import { useState, useRef } from "react";
import { Upload, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_SIZE_MB = 5;

export interface PassportExtractResult {
  passportNumber?: string;
  firstName?: string;
  lastName?: string;
  error?: string;
}

interface PassportUploadStepProps {
  onExtracted: (data: PassportExtractResult) => void;
  disabled?: boolean;
}

/** Convert File to base64 string (without data URL prefix). */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:mime;base64," prefix
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PassportUploadStep({ onExtracted, disabled }: PassportUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_SIZE_MB}MB.`);
      return;
    }

    const mime = file.type;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(mime)) {
      setError("Please upload a JPEG, PNG, WebP image, or PDF.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const fileBase64 = await fileToBase64(file);

      const { data, error: fnError } = await supabase.functions.invoke("visa-passport-ocr", {
        body: {
          fileBase64,
          mimeType: mime,
        },
      });

      if (fnError) {
        setError("Failed to process passport. Please enter details manually.");
        return;
      }

      if (data?.error) {
        setError(data.error);
        onExtracted({
          passportNumber: data.passportNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          error: data.error,
        });
      } else {
        setLastFile(file.name);
        onExtracted({
          passportNumber: data.passportNumber || "",
          firstName: data.firstName || "",
          lastName: data.lastName,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg.includes("abort") ? "Request timed out. Please try again." : msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload a clear photo or PDF of your passport front page. We will extract your passport number and first name. Your data is not stored.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting passport data...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Choose passport image or PDF
          </>
        )}
      </Button>

      {lastFile && !error && (
        <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
          <FileCheck className="h-4 w-4" />
          {lastFile} processed
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        You can also skip this step and enter your details manually in the next step.
      </p>
    </div>
  );
}
