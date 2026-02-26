import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { MapPin, Users, ExternalLink, CalendarDays } from "lucide-react";

const SavedItinerariesTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-saved-itineraries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_itineraries" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
    } catch { return `${currency} ${price}`; }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trip</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row: any) => {
            const guests = Array.isArray(row.guests) ? row.guests : [];
            const days = Array.isArray(row.days) ? row.days : [];
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <span className="font-medium text-foreground">{row.title || "Untitled"}</span>
                    {row.destination && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin size={10} /> {row.destination}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{row.customer_name || "—"}</p>
                    {row.customer_email && <p className="text-xs text-muted-foreground">{row.customer_email}</p>}
                    {row.customer_phone && <p className="text-xs text-muted-foreground">{row.customer_phone}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  {guests.length > 0 ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 text-sm hover:text-primary">
                          <Users size={12} /> {guests.length}
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Guests</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          {guests.map((g: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                              <span className="font-medium">{g.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {g.age && `${g.age} yrs`}{g.relation && ` · ${g.relation}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1 text-sm hover:text-primary">
                        <CalendarDays size={12} /> {days.length}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{row.title || "Itinerary"} — Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {days.map((d: any) => (
                          <div key={d.day}>
                            <h4 className="text-sm font-bold text-foreground mb-1">
                              Day {d.day} {d.date && <span className="font-normal text-muted-foreground ml-1">{d.date}</span>}
                            </h4>
                            <div className="space-y-1.5 ml-3">
                              {d.items?.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs flex justify-between border-b border-border/30 pb-1">
                                  <span>
                                    <Badge variant="outline" className="text-[10px] mr-1.5 capitalize">{item.type}</Badge>
                                    {item.title}
                                  </span>
                                  {item.price > 0 && <span className="font-medium">{formatPrice(item.price, row.currency)}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="font-medium">
                  {row.total_price > 0 ? formatPrice(row.total_price, row.currency) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(row.created_at), "dd MMM yyyy, HH:mm")}
                </TableCell>
                <TableCell>
                  <a
                    href={`/itinerary/${row.share_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink size={12} /> View
                  </a>
                </TableCell>
              </TableRow>
            );
          })}
          {!data?.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No saved itineraries yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SavedItinerariesTab;
