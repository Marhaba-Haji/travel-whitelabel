import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { downloadInvoice } from "@/lib/invoice-pdf";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";

const statusFilters = ["all", "initiated", "success", "failed"];

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  success: "default",
  initiated: "secondary",
  failed: "destructive",
};

const PaymentsTab = () => {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data: payments, error: pErr } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (pErr) throw pErr;
      const { data: regs } = await supabase.from("registrations").select("id, full_name, email");
      const regMap = new Map((regs ?? []).map((r) => [r.id, r]));
      return (payments ?? []).map((p) => ({ ...p, registration: regMap.get(p.registration_id ?? "") }));
    },
  });

  const filtered = filter === "all" ? data : data?.filter((p) => p.status === filter);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All" : s === "initiated" ? "Abandoned" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Txn ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.txn_id}</TableCell>
                <TableCell>{p.registration?.full_name ?? "—"}</TableCell>
                <TableCell>₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] ?? "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell>{p.payment_mode ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{format(new Date(p.created_at), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  {p.status === "success" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try { await downloadInvoice(p.txn_id); }
                        catch (e: any) { toast({ title: "Invoice failed", description: e.message, variant: "destructive" }); }
                      }}
                    >
                      <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
            {!filtered?.length && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsTab;
