import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getSessionId, getAttribution } from "@/hooks/useSessionTracking";
import { useToast } from "@/hooks/use-toast";

interface Magnet {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  file_url: string | null;
  cover_image_url: string | null;
  gated: boolean;
}

const Resource = () => {
  const { slug } = useParams<{ slug: string }>();
  const [magnet, setMagnet] = useState<Magnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("lead_magnets")
        .select("id, slug, title, description, file_url, cover_image_url, gated")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      setMagnet(data as Magnet | null);
      if (data && !data.gated && data.file_url) {
        setDownloadUrl(data.file_url);
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magnet || !email.trim()) return;
    setSubmitting(true);
    try {
      const attr = getAttribution();
      await supabase.from("lead_magnet_downloads").insert([{
        magnet_id: magnet.id,
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        source: `resource:${magnet.slug}`,
        utm: (attr as any) || {},
        session_id: getSessionId(),
      }]);
      await supabase.from("newsletter_subscriptions").insert([{
        email: email.trim().toLowerCase(),
        source: `resource:${magnet.slug}`,
        utm: (attr as any) || {},
      }]);
      await supabase.rpc("increment_lead_magnet_downloads", { _magnet_id: magnet.id });
      setDownloadUrl(magnet.file_url);
      toast({ title: "Your download is ready below" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!magnet) {
    return (
      <>
        <SEOHead title="Resource not found" description="This resource is unavailable." path={`/resource/${slug}`} noIndex />
        <Header />
        <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-3xl font-bold">Resource not found</h1>
          <p className="mt-3 text-muted-foreground">It may have been moved or unpublished.</p>
          <Button asChild className="mt-6"><Link to="/blog">Back to blog</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={magnet.title}
        description={magnet.description || `Download ${magnet.title} from Marhaba DMC.`}
        path={`/resource/${magnet.slug}`}
        image={magnet.cover_image_url || undefined}
      />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to blog</Link>
        </Button>
        <Card>
          <CardContent className="p-8 md:p-12">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Download className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{magnet.title}</h1>
            {magnet.description && (
              <p className="mt-4 text-muted-foreground">{magnet.description}</p>
            )}
            {downloadUrl ? (
              <div className="mt-8 flex flex-col items-start gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Your resource is ready</span>
                </div>
                <Button asChild size="lg">
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="mr-2 h-4 w-4" />Download now
                  </a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-3">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" disabled={submitting} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" disabled={submitting} />
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending</> : <>Get the resource</>}
                </Button>
                <p className="text-center text-xs text-muted-foreground">Free. No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default Resource;