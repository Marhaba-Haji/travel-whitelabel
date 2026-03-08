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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Phone, MessageSquare, Clock, Wrench, TrendingUp, Users, CalendarIcon, Download } from "lucide-react";
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
}

const AnalyticsTab = () => {
  const [preset, setPreset] = useState("30d");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

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
    const headers = ["Session ID", "Source", "Messages", "Visitor Name", "Visitor Email", "Connected At", "Last Active", "Created At", "Tool Calls"];
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

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

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
    </div>
  );
};

export default AnalyticsTab;
