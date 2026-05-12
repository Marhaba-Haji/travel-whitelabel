import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, Download, Home, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { buildICS, downloadICS } from "@/lib/ics";

export interface ConfirmationStepProps {
  date: Date;
  time: string;
  fullName: string;
  tz: string;
  dateStr: string;
  primaryBtnClass: string;
  secondaryBtnClass: string;
}

const ConfirmationStep = ({
  date,
  time,
  fullName,
  tz,
  dateStr,
  primaryBtnClass,
  secondaryBtnClass,
}: ConfirmationStepProps) => {
  const handleDownloadICS = () => {
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const ics = buildICS({
      title: "Marhaba DMC — Live Demo",
      description: "Live walkthrough of the Marhaba DMC platform.",
      location: "Online (link will be shared on WhatsApp)",
      start,
      durationMinutes: 30,
    });
    downloadICS(`marhaba-demo-${dateStr}-${time}.ics`, ics);
  };

  return (
    <div className="text-center py-6">
      <div className="mx-auto h-16 w-16 rounded-full bg-[#412A86]/10 flex items-center justify-center">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
      </div>
      <h3 className="mt-5 font-poppins font-bold text-2xl text-gray-900">You're booked!</h3>
      <p className="mt-2 text-gray-600">We'll send a confirmation on WhatsApp shortly.</p>

      <div className="mt-6 max-w-sm mx-auto p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-white text-left">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CalendarDays className="h-4 w-4 text-[#412A86]" />
          {format(date, "EEEE, d MMMM yyyy")}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <Clock className="h-4 w-4 text-[#412A86]" />
          {time} · 30 minutes ({tz})
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <UserIcon className="h-4 w-4 text-[#412A86]" />
          {fullName}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleDownloadICS} variant="outline" className={secondaryBtnClass}>
          <Download className="h-4 w-4 mr-1.5" /> Add to calendar
        </Button>
        <Link to="/">
          <Button className={primaryBtnClass}>
            <Home className="h-4 w-4 mr-1.5" /> Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationStep;