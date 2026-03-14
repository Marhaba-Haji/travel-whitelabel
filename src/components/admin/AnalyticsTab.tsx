import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Phone, MessageSquare, Clock, Wrench, TrendingUp, Users, CalendarIcon, Download, Eye, Mic, User, Mail, MapPin } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "All time", value: "all" },
  { label: "Custom", value: "custom" },
];

interface SessionRow {
  id: string;
  session_id: string;
  source: string;
  message_count: number;
  tool_calls: Record<string, number>;
  created_at: string;
  last_active_at: string;
  connected_at: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  conversation_summary: string | null;
  itinerary_state: any;
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const getSessionDuration = (r: SessionRow) => {
  if (!r.connected_at || !r.last_active_at) return null;
  const d = (new Date(r.last_active_at).getTime() - new Date(r.connected_at).getTime()) / 1000;
  return d > 0 && d < 7200 ? d : null;
};

/* ── Session Detail Dialog ─────────────────────────────────────────────── */

function SessionDetailDialog({ session, open, onOpenChange }: { session: SessionRow | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!session) return null;

  const duration = getSessionDuration(session);
  const toolEntries = session.tool_calls && typeof session.tool_calls === "object"
    ? Object.entries(session.tool_calls).filter(([, v]) => typeof v === "number" && v > 0).sort(([, a], [, b]) => (b as number) - (a as number))
    : [];
  const totalToolCalls = toolEntries.reduce((s, [, v]) => s + (v as number), 0);

  // Parse itinerary state
  const itinerary = session.itinerary_state;
  const hasTripInfo = itinerary?.tripInfo || itinerary?.title || itinerary?.destination;
  const itineraryDays = Array.isArray(itinerary?.days) ? itinerary.days : [];
  const itineraryGuests = Array.isArray(itinerary?.guests) ? itinerary.guests : [];

  // Parse conversation summary into structured parts
  const summaryParts = (session.conversation_summary || "").split(" | ").filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0" aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Session Details
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6 max-h-[70vh]">
          <div className="space-y-5">
            {/* Overview row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Source</p>
                <Badge variant="secondary" className="gap-1">
                  {session.source === "voice" ? <Mic className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                  {session.source}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{duration ? formatDuration(duration) : "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Messages</p>
                <p className="text-sm font-medium">{session.message_count || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tool Calls</p>
                <p className="text-sm font-medium">{totalToolCalls}</p>
              </div>
            </div>

            {/* Visitor info */}
            {(session.visitor_name || session.visitor_email) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><User className="h-4 w-4" /> Visitor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {session.visitor_name && <p><span className="text-muted-foreground">Name:</span> {session.visitor_name}</p>}
                    {session.visitor_email && (
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {session.visitor_email}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Timeline</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-muted-foreground shrink-0">Created</span>
                  <span>{format(new Date(session.created_at), "dd MMM yyyy, HH:mm:ss")}</span>
                </div>
                {session.connected_at && (
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-muted-foreground shrink-0">Connected</span>
                    <span>{format(new Date(session.connected_at), "dd MMM yyyy, HH:mm:ss")}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="w-24 text-muted-foreground shrink-0">Last Active</span>
                  <span>{format(new Date(session.last_active_at), "dd MMM yyyy, HH:mm:ss")}</span>
                </div>
              </div>
            </div>

            {/* Conversation Summary */}
            {summaryParts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Conversation Summary</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                    {summaryParts.map((part, i) => {
                      const colonIdx = part.indexOf(":");
                      if (colonIdx > 0 && colonIdx < 25) {
                        const label = part.slice(0, colonIdx).trim();
                        const value = part.slice(colonIdx + 1).trim();
                        return (
                          <div key={i} className="flex gap-2">
                            <span className="font-medium text-muted-foreground shrink-0">{label}:</span>
                            <span>{value}</span>
                          </div>
                        );
                      }
                      return <p key={i}>{part}</p>;
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Tool Call Timeline */}
            {toolEntries.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Wrench className="h-4 w-4" /> Tool Calls</h4>
                  <div className="space-y-2">
                    {toolEntries.map(([tool, count]) => {
                      const pct = totalToolCalls > 0 ? ((count as number) / totalToolCalls) * 100 : 0;
                      return (
                        <div key={tool} className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs shrink-0 min-w-[140px] justify-center">{tool}</Badge>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Itinerary State */}
            {hasTripInfo && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Itinerary Snapshot</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                    {(itinerary?.tripInfo?.title || itinerary?.title) && (
                      <p><span className="text-muted-foreground">Trip:</span> {itinerary?.tripInfo?.title || itinerary?.title}</p>
                    )}
                    {(itinerary?.tripInfo?.destination || itinerary?.destination) && (
                      <p><span className="text-muted-foreground">Destination:</span> {itinerary?.tripInfo?.destination || itinerary?.destination}</p>
                    )}
                    {itineraryGuests.length > 0 && (
                      <p><span className="text-muted-foreground">Guests:</span> {itineraryGuests.map((g: any) => g.name).join(", ")}</p>
                    )}
                    {itineraryDays.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        {itineraryDays.map((day: any, di: number) => {
                          const items = Array.isArray(day.items) ? day.items : [];
                          if (!items.length) return null;
                          return (
                            <div key={di}>
                              <p className="font-medium text-muted-foreground">Day {day.day || di + 1}{day.date ? ` — ${day.date}` : ""}</p>
                              <ul className="ml-4 list-disc text-xs space-y-0.5">
                                {items.map((item: any, ii: number) => (
                                  <li key={ii}>
                                    <span className="font-medium">{item.title}</span>
                                    {item.type && <Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0">{item.type}</Badge>}
                                    {item.price != null && <span className="ml-1 text-muted-foreground">— ₹{item.price}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Session ID */}
            <Separator />
            <p className="text-xs text-muted-foreground">Session ID: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{session.session_id}</code></p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Analytics Tab ────────────────────────────────────────────────── */

const AnalyticsTab = () => {
  const [preset, setPreset] = useState("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["admin-analytics-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_ai_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as unknown as SessionRow[];
    },
  });

  const { data: leadsCount } = useQuery({
    queryKey: ["admin-analytics-leads"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("voice_ai_leads")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Filter rows by date range
  const rows = useMemo(() => {
    const all = sessions ?? [];
    if (preset === "all") return all;

    let from: Date;
    let to: Date = endOfDay(new Date());

    if (preset === "custom") {
      if (!customFrom) return all;
      from = startOfDay(customFrom);
      to = customTo ? endOfDay(customTo) : to;
    } else {
      const days = parseInt(preset);
      from = startOfDay(subDays(new Date(), days));
    }

    return all.filter(r => {
      const d = new Date(r.created_at);
      return isWithinInterval(d, { start: from, end: to });
    });
  }, [sessions, preset, customFrom, customTo]);

  // Export to CSV
  const exportCSV = useCallback(() => {
    if (!rows.length) return;
    const headers = ["Session ID", "Source", "Messages", "Visitor Name", "Visitor Email", "Connected At", "Last Active", "Created At", "Tool Calls", "Summary"];
    const csvRows = rows.map(r => [
      r.session_id,
      r.source,
      r.message_count,
      r.visitor_name ?? "",
      r.visitor_email ?? "",
      r.connected_at ?? "",
      r.last_active_at,
      r.created_at,
      r.tool_calls ? Object.entries(r.tool_calls).map(([k, v]) => `${k}:${v}`).join("; ") : "",
      r.conversation_summary ?? "",
    ]);
    const csv = [headers, ...csvRows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nyra-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  if (sessionsLoading) return <p className="text-muted-foreground">Loading analytics...</p>;

  // Compute metrics
  const totalSessions = rows.length;
  const voiceSessions = rows.filter(r => r.source === "voice").length;
  const chatSessions = rows.filter(r => r.source === "chat").length;
  const totalMessages = rows.reduce((s, r) => s + (r.message_count || 0), 0);

  const durations = rows
    .filter(r => r.connected_at && r.last_active_at)
    .map(r => (new Date(r.last_active_at).getTime() - new Date(r.connected_at!).getTime()) / 1000)
    .filter(d => d > 0 && d < 7200);
  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const toolTotals: Record<string, number> = {};
  for (const r of rows) {
    if (r.tool_calls && typeof r.tool_calls === "object") {
      for (const [tool, count] of Object.entries(r.tool_calls)) {
        toolTotals[tool] = (toolTotals[tool] || 0) + (typeof count === "number" ? count : 0);
      }
    }
  }
  const toolData = Object.entries(toolTotals).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const sessionsWithEmail = rows.filter(r => r.visitor_email).length;
  const conversionRate = totalSessions > 0 ? ((sessionsWithEmail / totalSessions) * 100).toFixed(1) : "0";

  const sourceData = [
    { name: "Voice", value: voiceSessions },
    { name: "Chat", value: chatSessions },
  ].filter(d => d.value > 0);

  const dayMap: Record<string, number> = {};
  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  }
  const dailyData = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));

  const statCards = [
    { label: "Total Sessions", value: totalSessions, icon: Users, color: "text-primary" },
    { label: "Avg Call Duration", value: formatDuration(avgDuration), icon: Clock, color: "text-primary" },
    { label: "Total Messages", value: totalMessages, icon: MessageSquare, color: "text-primary" },
    { label: "Lead Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-primary" },
    { label: "Voice Sessions", value: voiceSessions, icon: Phone, color: "text-primary" },
    { label: "Total Leads", value: leadsCount ?? 0, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger className="w-[160px]">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customFrom ? format(customFrom, "dd MMM yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} initialFocus />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-sm">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customTo ? format(customTo, "dd MMM yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customTo} onSelect={setCustomTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!rows.length} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(c => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sessions Per Day</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center pt-20">No data in selected range</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Session Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data in selected range</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tool usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Tool Usage Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          {toolData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead className="text-right">Total Calls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toolData.map(t => (
                    <TableRow key={t.name}>
                      <TableCell>
                        <Badge variant="secondary">{t.name}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{t.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No tool usage data in selected range</p>
          )}
        </CardContent>
      </Card>

      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" /> Session History
            <span className="text-muted-foreground font-normal ml-1">({rows.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tools Used</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map(r => {
                    const dur = getSessionDuration(r);
                    const toolCount = r.tool_calls && typeof r.tool_calls === "object"
                      ? Object.values(r.tool_calls).reduce((s: number, v) => s + (typeof v === "number" ? v : 0), 0)
                      : 0;
                    return (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedSession(r)}
                      >
                        <TableCell className="font-medium">
                          {r.visitor_name || <span className="text-muted-foreground italic">Anonymous</span>}
                          {r.visitor_email && (
                            <p className="text-xs text-muted-foreground">{r.visitor_email}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1 text-xs">
                            {r.source === "voice" ? <Mic className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            {r.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.message_count || 0}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {dur ? formatDuration(dur) : "—"}
                        </TableCell>
                        <TableCell>{toolCount || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(r.created_at), "dd MMM, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">Showing 50 of {rows.length} sessions</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No sessions in selected range</p>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <SessionDetailDialog
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(v) => { if (!v) setSelectedSession(null); }}
      />
    </div>
  );
};

export default AnalyticsTab;
