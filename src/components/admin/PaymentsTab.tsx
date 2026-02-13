import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
              </TableRow>
            ))}
            {!filtered?.length && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsTab;
