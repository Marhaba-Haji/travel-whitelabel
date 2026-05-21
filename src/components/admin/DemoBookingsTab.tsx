import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfWeek, endOfWeek, isSameDay, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
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
  ChevronLeft,
  ChevronRight,
  Send,
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
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleDirty, setScheduleDirty] = useState(false);
  const [schedule, setSchedule] = useState<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    unavailable_ranges: { start: string; end: string }[];
    is_holiday: boolean;
  }[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const WEEKDAYS = [
    { id: 0, label: "Sunday" },
    { id: 1, label: "Monday" },
    { id: 2, label: "Tuesday" },
    { id: 3, label: "Wednesday" },
    { id: 4, label: "Thursday" },
    { id: 5, label: "Friday" },
    { id: 6, label: "Saturday" },
  ];
  const [copySourceDay, setCopySourceDay] = useState<number>(1);

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
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setScheduleLoading(true);
    const { data, error } = await supabase
      .from("demo_schedule_settings")
      .select("day_of_week, start_time, end_time, unavailable_ranges, is_holiday");
    if (error) {
      toast.error(error.message);
      setScheduleLoading(false);
      return;
    }

    // build default week
    const defaults = WEEKDAYS.map((d) => ({
      day_of_week: d.id,
      start_time: "09:00",
      end_time: "17:00",
      unavailable_ranges: [] as { start: string; end: string }[],
      is_holiday: false,
    }));

    (data || []).forEach((row: any) => {
      const idx = defaults.findIndex((d) => d.day_of_week === row.day_of_week);
      if (idx >= 0) {
        defaults[idx] = {
          day_of_week: row.day_of_week,
          start_time: row.start_time || "09:00",
          end_time: row.end_time || "17:00",
          unavailable_ranges: Array.isArray(row.unavailable_ranges)
            ? row.unavailable_ranges
            : [],
          is_holiday: Boolean(row.is_holiday),
        };
      }
    });

    setSchedule(defaults);
    setScheduleLoading(false);
    setScheduleDirty(false);
  };

  const saveSchedule = async () => {
    setScheduleLoading(true);
    try {
      const payload = schedule.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        unavailable_ranges: s.unavailable_ranges,
        is_holiday: s.is_holiday,
      }));

      const { error } = await supabase
        .from("demo_schedule_settings")
        .upsert(payload, { onConflict: "day_of_week" });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Schedule saved");
        setScheduleDirty(false);
        loadSchedule();
      }
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setScheduleLoading(false);
    }
  };

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

  const resendInvite = async (id: string) => {
    toast.loading("Sending invite...", { id: `resend-${id}` });
    try {
      const { data, error } = await supabase.functions.invoke("demo-booking-confirm", {
        body: { bookingId: id, resend: true },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Invite re-sent", { id: `resend-${id}` });
    } catch (e: any) {
      toast.error(e?.message || "Failed to resend invite", { id: `resend-${id}` });
    }
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

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, DemoBooking[]> = {};
    bookings.forEach((b) => {
      if (!map[b.booking_date]) map[b.booking_date] = [];
      map[b.booking_date].push(b);
    });
    return map;
  }, [bookings]);

  // Get date range based on view
  const getDateRange = () => {
    const today = new Date(calendarDate);
    if (calendarView === "day") {
      return { start: today, end: today };
    } else if (calendarView === "week") {
      return { start: startOfWeek(today), end: endOfWeek(today) };
    } else {
      return { start: startOfMonth(today), end: endOfMonth(today) };
    }
  };

  const dateRange = getDateRange();

  // Get bookings for current view
  const bookingsInView = useMemo(() => {
    return bookings.filter((b) => {
      const bDate = parseISO(b.booking_date);
      return isWithinInterval(bDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [bookings, dateRange]);

  // Get count of bookings for a specific date
  const getBookingCount = (date: Date): number => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookingsByDate[dateStr]?.length || 0;
  };

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#412A86]/10 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6 text-[#412A86]" />
            </div>
            Demo Bookings
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage all booked demo slots and configure booking availability.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: CalendarCheck, color: "text-[#412A86]" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-blue-600" },
            { label: "This week", value: stats.thisWeek, icon: TrendingUp, color: "text-emerald-600" },
            { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-rose-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-4 shadow-soft hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-600">
                  {s.label}
                </span>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div className="mt-3 text-3xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-soft p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#412A86]" />
              Bookings Calendar
            </h3>
            <p className="text-sm text-muted-foreground mt-1">View bookings by day, week, or month.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {["day", "week", "month"].map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view as "day" | "week" | "month")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all ${
                    calendarView === view
                      ? "bg-[#412A86] text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              const newDate = new Date(calendarDate);
              if (calendarView === "day") newDate.setDate(newDate.getDate() - 1);
              else if (calendarView === "week") newDate.setDate(newDate.getDate() - 7);
              else newDate.setMonth(newDate.getMonth() - 1);
              setCalendarDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h4 className="text-lg font-semibold text-gray-900">
            {calendarView === "day"
              ? format(calendarDate, "EEEE, MMMM d, yyyy")
              : calendarView === "week"
              ? `${format(startOfWeek(calendarDate), "MMM d")} - ${format(endOfWeek(calendarDate), "MMM d, yyyy")}`
              : format(calendarDate, "MMMM yyyy")}
          </h4>
          <button
            onClick={() => {
              const newDate = new Date(calendarDate);
              if (calendarView === "day") newDate.setDate(newDate.getDate() + 1);
              else if (calendarView === "week") newDate.setDate(newDate.getDate() + 7);
              else newDate.setMonth(newDate.getMonth() + 1);
              setCalendarDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        {calendarView === "month" && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {eachDayOfInterval({
                start: startOfMonth(calendarDate),
                end: endOfMonth(calendarDate),
              }).map((date) => {
                const count = getBookingCount(date);
                const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
                return (
                  <div
                    key={format(date, "yyyy-MM-dd")}
                    className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isCurrentMonth
                        ? "bg-white border-gray-200 hover:border-[#412A86]"
                        : "bg-gray-50 border-gray-100"
                    } ${count > 0 ? "border-[#412A86] bg-blue-50" : ""}`}
                    onClick={() => {
                      setCalendarDate(date);
                      setCalendarView("day");
                    }}
                  >
                    <span className={`text-sm font-semibold ${isCurrentMonth ? "text-gray-900" : "text-gray-500"}`}>
                      {format(date, "d")}
                    </span>
                    {count > 0 && (
                      <span className="mt-1 text-xs font-bold text-[#412A86] bg-blue-100 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {calendarView === "week" && (
          <div className="space-y-3">
            {eachDayOfInterval({ start: startOfWeek(calendarDate), end: endOfWeek(calendarDate) }).map(
              (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayBookings = bookingsByDate[dateStr] || [];
                return (
                  <div
                    key={dateStr}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#412A86] hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{format(date, "EEEE, MMM d")}</span>
                      <span className="text-xs font-bold text-[#412A86] bg-blue-100 px-2 py-1 rounded-full">
                        {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {dayBookings.length > 0 ? (
                      <div className="space-y-1">
                        {dayBookings.map((b) => (
                          <div key={b.id} className="text-xs bg-white border border-gray-200 rounded px-2 py-1">
                            <span className="font-medium">{b.booking_time}</span> - {b.full_name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No bookings</span>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}

        {calendarView === "day" && (
          <div>
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-4">
                {bookingsByDate[format(calendarDate, "yyyy-MM-dd")]?.length || 0} Booking
                {(bookingsByDate[format(calendarDate, "yyyy-MM-dd")]?.length || 0) !== 1 ? "s" : ""} on{" "}
                {format(calendarDate, "EEEE, MMMM d, yyyy")}
              </h5>
              {(bookingsByDate[format(calendarDate, "yyyy-MM-dd")] || []).length > 0 ? (
                <div className="space-y-3">
                  {(bookingsByDate[format(calendarDate, "yyyy-MM-dd")] || [])
                    .sort((a, b) => a.booking_time.localeCompare(b.booking_time))
                    .map((b) => (
                      <div key={b.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{b.booking_time}</span>
                          <Badge variant="outline" className={cn("capitalize", statusColors[b.status])}>
                            {b.status}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>{b.full_name}</div>
                          <div className="text-gray-600">
                            <a href={`https://wa.me/${b.country_code.replace("+", "")}${b.whatsapp_number}`} target="_blank" rel="noreferrer" className="text-[#412A86] hover:underline">
                              {b.country_code} {b.whatsapp_number}
                            </a>
                          </div>
                          {b.email && <div className="text-gray-600">{b.email}</div>}
                          {b.notes && <div className="text-gray-600">Notes: {b.notes}</div>}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No bookings on this day
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#412A86]" />
            All Bookings
          </h3>
          <p className="text-sm text-muted-foreground mt-1">View and manage all demo booking requests.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
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
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-soft">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No demo bookings yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">WhatsApp</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => {
                    const waNumber = `${b.country_code.replace("+", "")}${b.whatsapp_number}`;
                    return (
                      <TableRow key={b.id} className="hover:bg-gray-50">
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resendInvite(b.id)}
                              title="Resend Google Meet invite (email + WhatsApp)"
                            >
                              <Send className="h-4 w-4 text-indigo-600" />
                            </Button>
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

      {/* Schedule Settings */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#412A86]" />
              Demo Availability Settings
            </h3>
            <p className="text-sm text-gray-600 mt-1">Configure start/end times, mark holidays, and set unavailable time blocks per weekday.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={loadSchedule} disabled={scheduleLoading}>Reload</Button>
            <Button size="sm" onClick={saveSchedule} disabled={scheduleLoading || !scheduleDirty} className="bg-[#412A86] hover:bg-[#412A86]/90">
              {scheduleLoading ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </div>

        {/* Quick Copy Controls */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm font-semibold text-gray-700">Quick Copy:</div>
            <Select value={`${copySourceDay}`} onValueChange={(v)=>setCopySourceDay(Number(v))}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d)=> (
                  <SelectItem key={d.id} value={`${d.id}`}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={()=>{
              const src = schedule.find(s=>s.day_of_week===copySourceDay);
              if(!src) return toast.error('No source data');
              setSchedule(prev=>prev.map(p=>({ ...p, start_time: src.start_time, end_time: src.end_time, unavailable_ranges: JSON.parse(JSON.stringify(src.unavailable_ranges)), is_holiday: src.is_holiday })));
              setScheduleDirty(true);
              toast.success('Copied to all days');
            }}>Copy to all</Button>
            <Button size="sm" variant="outline" onClick={()=>{
              const src = schedule.find(s=>s.day_of_week===copySourceDay);
              if(!src) return toast.error('No source data');
              const weekdays = [1,2,3,4,5];
              setSchedule(prev=>prev.map(p=>weekdays.includes(p.day_of_week)?{ ...p, start_time: src.start_time, end_time: src.end_time, unavailable_ranges: JSON.parse(JSON.stringify(src.unavailable_ranges)), is_holiday: src.is_holiday }:p));
              setScheduleDirty(true);
              toast.success('Copied to weekdays');
            }}>Copy to weekdays</Button>
            <Button size="sm" variant="outline" onClick={()=>{
              const src = schedule.find(s=>s.day_of_week===copySourceDay);
              if(!src) return toast.error('No source data');
              const weekends = [0,6];
              setSchedule(prev=>prev.map(p=>weekends.includes(p.day_of_week)?{ ...p, start_time: src.start_time, end_time: src.end_time, unavailable_ranges: JSON.parse(JSON.stringify(src.unavailable_ranges)), is_holiday: src.is_holiday }:p));
              setScheduleDirty(true);
              toast.success('Copied to weekends');
            }}>Copy to weekends</Button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Day</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Holiday</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Start Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">End Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Unavailable Times</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.day_of_week} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-900">{WEEKDAYS.find(w=>w.id===s.day_of_week)?.label}</td>
                  <td className="px-4 py-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={s.is_holiday} 
                        onChange={(e)=>{
                          const v = e.target.checked;
                          setSchedule((prev)=>prev.map(p=>p.day_of_week===s.day_of_week?{...p,is_holiday:v}:p));
                          setScheduleDirty(true);
                        }} 
                        className="cursor-pointer rounded" 
                      />
                      <span className="text-xs text-gray-600">{s.is_holiday ? "Marked" : "Not marked"}</span>
                    </label>
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      type="time" 
                      value={s.start_time} 
                      disabled={s.is_holiday} 
                      onChange={(e)=>{
                        const v = e.target.value;
                        setSchedule((prev)=>prev.map(p=>p.day_of_week===s.day_of_week?{...p,start_time:v}:p));
                        setScheduleDirty(true);
                      }} 
                      className={`border rounded-lg px-3 py-2 text-sm font-medium ${s.is_holiday ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#412A86] focus:border-transparent'}`} 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      type="time" 
                      value={s.end_time} 
                      disabled={s.is_holiday} 
                      onChange={(e)=>{
                        const v = e.target.value;
                        setSchedule((prev)=>prev.map(p=>p.day_of_week===s.day_of_week?{...p,end_time:v}:p));
                        setScheduleDirty(true);
                      }} 
                      className={`border rounded-lg px-3 py-2 text-sm font-medium ${s.is_holiday ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#412A86] focus:border-transparent'}`} 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      type="text" 
                      value={s.unavailable_ranges.map(r=>`${r.start}-${r.end}`).join(", ")} 
                      disabled={s.is_holiday} 
                      placeholder="e.g. 12:00-13:00, 15:30-16:00"
                      onChange={(e)=>{
                        const v = e.target.value;
                        const ranges = v.split(",").map(r=>r.trim()).filter(Boolean).map(r=>{
                          const [start, end] = r.split("-").map(x=>x.trim());
                          return { start: start||"00:00", end: end||"00:00" };
                        });
                        setSchedule((prev)=>prev.map(p=>p.day_of_week===s.day_of_week?{...p,unavailable_ranges:ranges}:p));
                        setScheduleDirty(true);
                      }} 
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${s.is_holiday ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#412A86] focus:border-transparent'}`} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DemoBookingsTab;