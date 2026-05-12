import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Users, CreditCard, AlertTriangle, Mic, CalendarCheck, CalendarClock, CalendarX } from "lucide-react";

const OverviewTab = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [enquiries, voiceAiLeads, newsletter, registrations, payments, demos] = await Promise.all([
        supabase.from("contact_enquiries").select("id", { count: "exact", head: true }),
        supabase.from("voice_ai_leads").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id, status"),
        supabase.from("demo_bookings").select("id, status, booking_date"),
      ]);
      const paymentRows = payments.data ?? [];
      const successPayments = paymentRows.filter((p) => p.status === "success").length;
      const abandonedPayments = paymentRows.filter((p) => p.status === "initiated").length;
      const demoRows = demos.data ?? [];
      const totalDemos = demoRows.length;
      const upcomingDemos = demoRows.filter(
        (d: any) => d.status !== "cancelled" && (d.booking_date ?? "") >= today,
      ).length;
      const completedDemos = demoRows.filter((d: any) => d.status === "completed").length;
      const cancelledDemos = demoRows.filter((d: any) => d.status === "cancelled").length;
      return {
        enquiries: enquiries.count ?? 0,
        voiceAiLeads: voiceAiLeads.count ?? 0,
        newsletter: newsletter.count ?? 0,
        registrations: registrations.count ?? 0,
        totalPayments: paymentRows.length,
        successPayments,
        abandonedPayments,
        totalDemos,
        upcomingDemos,
        completedDemos,
        cancelledDemos,
      };
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  const cards = [
    { label: "Contact Enquiries", value: stats?.enquiries, icon: MessageSquare, color: "text-primary" },
    { label: "Voice AI Leads", value: stats?.voiceAiLeads, icon: Mic, color: "text-primary" },
    { label: "Newsletter Signups", value: stats?.newsletter, icon: Mail, color: "text-primary" },
    { label: "Total Registrations", value: stats?.registrations, icon: Users, color: "text-primary" },
    { label: "Successful Payments", value: stats?.successPayments, icon: CreditCard, color: "text-primary" },
    { label: "Abandoned Payments", value: stats?.abandonedPayments, icon: AlertTriangle, color: "text-destructive" },
    { label: "Demo Bookings (Total)", value: stats?.totalDemos, icon: CalendarCheck, color: "text-primary" },
    { label: "Upcoming Demos", value: stats?.upcomingDemos, icon: CalendarClock, color: "text-primary" },
    { label: "Completed Demos", value: stats?.completedDemos, icon: CalendarCheck, color: "text-primary" },
    { label: "Cancelled Demos", value: stats?.cancelledDemos, icon: CalendarX, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value ?? 0}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OverviewTab;
