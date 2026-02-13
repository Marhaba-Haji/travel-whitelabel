import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const NewsletterTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscriptions").select("*").order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">Total subscribers: <span className="font-semibold text-foreground">{data?.length ?? 0}</span></p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{format(new Date(row.subscribed_at), "dd MMM yyyy, HH:mm")}</TableCell>
              </TableRow>
            ))}
            {!data?.length && (
              <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No subscribers yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NewsletterTab;
