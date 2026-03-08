import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const IndexingLogsTab = () => {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["indexing-logs", serviceFilter],
    queryFn: async () => {
      let query = supabase
        .from("indexing_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (serviceFilter && serviceFilter !== "all") {
        query = query.eq("service", serviceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs?.filter((log) =>
    search ? log.url.toLowerCase().includes(search.toLowerCase()) : true
  );

  const getStatusBadge = (statusCode: number | null, error: string | null) => {
    if (error) return <Badge variant="destructive">Error</Badge>;
    if (!statusCode) return <Badge variant="secondary">Unknown</Badge>;
    if (statusCode >= 200 && statusCode < 300) return <Badge className="bg-green-600 hover:bg-green-700 text-white">{statusCode}</Badge>;
    if (statusCode >= 400) return <Badge variant="destructive">{statusCode}</Badge>;
    return <Badge variant="secondary">{statusCode}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="indexnow">IndexNow</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="w-[100px]">Service</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[180px]">Time</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !filtered?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No indexing logs found</TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="max-w-[300px]">
                      <a
                        href={log.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 truncate"
                        title={log.url}
                      >
                        <span className="truncate">{log.url.replace(/^https?:\/\/[^/]+/, "")}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{log.service}</Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground text-xs">{log.action}</TableCell>
                    <TableCell>{getStatusBadge(log.status_code, log.error)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-xs text-destructive truncate" title={log.error ?? ""}>
                      {log.error ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {filtered && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} log{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default IndexingLogsTab;
