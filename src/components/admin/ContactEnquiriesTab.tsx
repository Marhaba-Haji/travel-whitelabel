import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  read: "bg-muted text-muted-foreground",
  responded: "bg-accent text-accent-foreground",
};

const ContactEnquiriesTab = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_enquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_enquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] }),
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
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-left truncate block w-full hover:text-primary">{row.message}</button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Message from {row.name}</DialogTitle></DialogHeader>
                    <p className="text-sm whitespace-pre-wrap">{row.message}</p>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                <Select value={row.status} onValueChange={(v) => updateStatus.mutate({ id: row.id, status: v })}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["new", "read", "responded"].map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge variant="secondary" className={statusColors[s]}>{s}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{format(new Date(row.created_at), "dd MMM yyyy")}</TableCell>
            </TableRow>
          ))}
          {!data?.length && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No enquiries yet</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactEnquiriesTab;
