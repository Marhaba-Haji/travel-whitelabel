import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import {
  CalendarCheck,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DemoBooking {
  id: string;
  full_name: string;
  country_code: string;
  whatsapp_number: string;
  email: string | null;
  booking_date: string;
  booking_time: string;
  timezone: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const DemoBookingsTab = () => {
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("demo_bookings")
      .select("*")
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: true });
    if (error) toast.error(error.message);
    setBookings((data || []) as DemoBooking[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("demo_bookings")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked as ${status}`);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.full_name.toLowerCase().includes(q) ||
        (b.email || "").toLowerCase().includes(q) ||
        b.whatsapp_number.includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wkStart = startOfWeek(today);
    const wkEnd = endOfWeek(today);
    let total = 0,
      upcoming = 0,
      thisWeek = 0,
      cancelled = 0;
    bookings.forEach((b) => {
      total++;
      if (b.status === "cancelled") cancelled++;
      const d = parseISO(b.booking_date);
      if (b.status === "confirmed" && d >= today) upcoming++;
      if (d >= wkStart && d <= wkEnd) thisWeek++;
    });
    return { total, upcoming, thisWeek, cancelled };
  }, [bookings]);

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Time",
        "Name",
        "Country Code",
        "WhatsApp",
        "Email",
        "Status",
        "Timezone",
        "Notes",
        "Created",
      ],
      ...filtered.map((b) => [
        b.booking_date,
        b.booking_time,
        b.full_name,
        b.country_code,
        b.whatsapp_number,
        b.email || "",
        b.status,
        b.timezone,
        (b.notes || "").replace(/\n/g, " "),
        b.created_at,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demo-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-[#412A86]" /> Demo Bookings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            All booked demo slots from the public booking page.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: CalendarCheck, color: "text-[#412A86]" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-blue-600" },
          { label: "This week", value: stats.thisWeek, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-rose-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white border border-gray-100 p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </span>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No demo bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => {
                  const waNumber = `${b.country_code.replace("+", "")}${b.whatsapp_number}`;
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(parseISO(b.booking_date), "EEE, d MMM yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {b.booking_time} · {b.timezone}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{b.full_name}</TableCell>
                      <TableCell>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#412A86] hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {b.country_code} {b.whatsapp_number}
                        </a>
                      </TableCell>
                      <TableCell>
                        {b.email ? (
                          <a
                            href={`mailto:${b.email}`}
                            className="text-sm text-[#412A86] hover:underline inline-flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {b.email}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", statusColors[b.status])}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {b.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {b.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(b.id, "completed")}
                              title="Mark as completed"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          {b.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(b.id, "cancelled")}
                              title="Cancel booking"
                            >
                              <XCircle className="h-4 w-4 text-rose-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoBookingsTab;