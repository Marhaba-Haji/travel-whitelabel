import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Mic } from "lucide-react";

const VoiceAILeadsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-voice-ai-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_ai_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone ?? "—"}</TableCell>
              <TableCell className="max-w-[200px]">
                {row.notes ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-left truncate block w-full hover:text-primary">
                        {row.notes}
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Notes from {row.name}</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm whitespace-pre-wrap">{row.notes}</p>
                    </DialogContent>
                  </Dialog>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="gap-1">
                  <Mic className="h-3 w-3" />
                  {row.source}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(row.created_at), "dd MMM yyyy, HH:mm")}
              </TableCell>
            </TableRow>
          ))}
          {!data?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No voice AI leads yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VoiceAILeadsTab;
