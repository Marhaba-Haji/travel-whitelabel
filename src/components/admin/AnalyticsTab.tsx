import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Phone, MessageSquare, Clock, Wrench, TrendingUp, Users } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

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
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["admin-analytics-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_ai_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
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

  if (sessionsLoading) return <p className="text-muted-foreground">Loading analytics...</p>;

  const rows = sessions ?? [];

  // Compute metrics
  const totalSessions = rows.length;
  const voiceSessions = rows.filter(r => r.source === "voice").length;
  const chatSessions = rows.filter(r => r.source === "chat").length;
  const totalMessages = rows.reduce((s, r) => s + (r.message_count || 0), 0);

  // Call duration (seconds) from connected_at → last_active_at
  const durations = rows
    .filter(r => r.connected_at && r.last_active_at)
    .map(r => (new Date(r.last_active_at).getTime() - new Date(r.connected_at!).getTime()) / 1000)
    .filter(d => d > 0 && d < 7200); // sanity: < 2 hours

  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Tool usage aggregation
  const toolTotals: Record<string, number> = {};
  for (const r of rows) {
    if (r.tool_calls && typeof r.tool_calls === "object") {
      for (const [tool, count] of Object.entries(r.tool_calls)) {
        toolTotals[tool] = (toolTotals[tool] || 0) + (typeof count === "number" ? count : 0);
      }
    }
  }
  const toolData = Object.entries(toolTotals)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Lead conversion rate
  const sessionsWithEmail = rows.filter(r => r.visitor_email).length;
  const conversionRate = totalSessions > 0 ? ((sessionsWithEmail / totalSessions) * 100).toFixed(1) : "0";

  // Source breakdown for pie chart
  const sourceData = [
    { name: "Voice", value: voiceSessions },
    { name: "Chat", value: chatSessions },
  ].filter(d => d.value > 0);

  // Sessions per day (last 30 days)
  const dayMap: Record<string, number> = {};
  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  }
  const dailyData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }));

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
        {/* Sessions per day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sessions Per Day (Last 30 Days)</CardTitle>
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
              <p className="text-muted-foreground text-center pt-20">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Source breakdown */}
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
              <p className="text-muted-foreground">No data yet</p>
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
            <p className="text-muted-foreground text-center py-8">No tool usage data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
