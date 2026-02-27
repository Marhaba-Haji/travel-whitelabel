import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUCKET = "voice-ai-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const DOCUMENT_TYPES = [
  "passport",
  "air_ticket",
  "hotel_booking",
  "visa",
  "passport_photo",
  "other",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { email, documentType, fileName, fileBase64, mimeType } = body || {};

    if (!email?.trim() || !documentType || !fileBase64) {
      return new Response(
        JSON.stringify({
          error: "email, documentType, and fileBase64 are required",
          uploaded: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required", uploaded: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedType = String(documentType).toLowerCase().replace(/\s/g, "_");
    if (!DOCUMENT_TYPES.includes(sanitizedType)) {
      return new Response(
        JSON.stringify({
          error: `documentType must be one of: ${DOCUMENT_TYPES.join(", ")}`,
          uploaded: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeMime = mimeType && ALLOWED_TYPES.includes(mimeType) ? mimeType : "application/octet-stream";
    const safeName = (fileName || "document").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    const ext = safeName.includes(".") ? "" : (safeMime === "application/pdf" ? ".pdf" : ".jpg");
    const storageName = `${trimmedEmail.replace(/[^a-zA-Z0-9]/g, "_")}/${Date.now()}_${safeName}${ext}`;

    const binaryString = atob(fileBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes.length > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Max 10MB.", uploaded: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageName, bytes, {
        contentType: safeMime,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          error: "Upload failed. Ensure bucket 'voice-ai-documents' exists in Storage.",
          uploaded: false,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: signedData } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storageName, 60 * 60 * 24 * 7);
    const fileUrl = signedData?.signedUrl || `https://${new URL(SUPABASE_URL).hostname}/storage/v1/object/public/${BUCKET}/${storageName}`;

    const { error: insertError } = await supabase.from("voice_ai_lead_documents").insert({
      lead_email: trimmedEmail,
      document_type: sanitizedType,
      file_url: fileUrl,
      file_name: safeName + ext,
      file_size: bytes.length,
      mime_type: safeMime,
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save document record", uploaded: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        uploaded: true,
        documentType: sanitizedType,
        fileName: safeName + ext,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("voice-ai-document-upload error:", err);
    return new Response(
      JSON.stringify({ error: "Server error. Please try again.", uploaded: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
