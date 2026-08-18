import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw } from "lucide-react";

const fetchLeads = async () => {
  const { data, error } = await supabase
    .from("umrah_leads" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data || []) as any[];
};

const statusVariant = (s: string) =>
  s === "paid" ? "default" : s === "failed" ? "destructive" : "secondary";

const UmrahLeadsTab = () => {
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["umrah-leads"],
    queryFn: fetchLeads,
  });
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((r) =>
      [r.full_name, r.phone_e164, r.email, r.city, r.txnid].some((v: string) =>
        (v || "").toLowerCase().includes(term),
      ),
    );
  }, [data, q]);

  const kpis = useMemo(() => {
    const paid = data.filter((r) => r.status === "paid");
    return {
      total: data.length,
      enquiries: data.filter((r) => r.lead_type === "enquiry").length,
      paid: paid.length,
      pax: data.reduce((s, r) => s + (Number(r.travellers) || 0), 0),
      collected: paid.reduce((s, r) => s + (Number(r.amount_inr) || 0), 0),
    };
  }, [data]);

  const exportCsv = () => {
    const cols = ["created_at", "full_name", "phone_e164", "email", "city", "travellers", "room_preference", "lead_type", "status", "amount_inr", "txnid", "message"];
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `umrah-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Total leads", v: kpis.total },
          { l: "Enquiries", v: kpis.enquiries },
          { l: "Paid bookings", v: kpis.paid },
          { l: "Total pax", v: kpis.pax },
          { l: "Collected", v: `₹${kpis.collected.toLocaleString("en-IN")}` },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</p>
              <p className="text-2xl font-bold mt-1">{k.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle>Umrah leads &amp; bookings</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search name, phone, email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56"
            />
            <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh leads">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">City</th>
                    <th className="py-2 pr-3">Pax</th>
                    <th className="py-2 pr-3">Room</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="py-2 pr-3 font-medium">{r.full_name}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{r.phone_e164}</td>
                      <td className="py-2 pr-3">{r.city || "—"}</td>
                      <td className="py-2 pr-3">{r.travellers}</td>
                      <td className="py-2 pr-3">{r.room_preference || "—"}</td>
                      <td className="py-2 pr-3 capitalize">{r.lead_type}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={statusVariant(r.status) as any} className="capitalize">{r.status}</Badge>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {Number(r.amount_inr) > 0 ? `₹${Number(r.amount_inr).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{r.txnid || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UmrahLeadsTab;
