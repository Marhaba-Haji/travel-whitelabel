import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const statuses = ["all", "pending_payment", "payment_completed", "active", "inactive"];

const PLAN_BADGE_VARIANT: Record<string, string> = {
  "Launch Plan": "secondary",
  "Growth Plan": "default",
  "Authority Plan": "outline",
};

const RegistrationsTab = () => {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = filter === "all" ? data : data?.filter((r) => r.status === filter);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((r) => (
              <TableRow key={r.id} className={cn(r.status === "pending_payment" && "bg-destructive/5")}>
                <TableCell className="font-medium">{r.full_name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.city ?? "—"}</TableCell>
                <TableCell>
                  {r.plan_name ? (
                    <Badge
                      variant={
                        (PLAN_BADGE_VARIANT[r.plan_name] as "secondary" | "default" | "outline" | "destructive") ??
                        "secondary"
                      }
                      className={cn(
                        r.plan_name === "Growth Plan" && "bg-primary text-primary-foreground border-0",
                        r.plan_name === "Authority Plan" && "border-border text-foreground"
                      )}
                    >
                      {r.plan_name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "pending_payment" ? "destructive" : "secondary"}>
                    {r.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(r.created_at), "dd MMM yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {!filtered?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No registrations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RegistrationsTab;
