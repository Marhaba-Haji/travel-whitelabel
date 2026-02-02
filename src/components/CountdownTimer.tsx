import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate, className = "" }: CountdownTimerProps) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className={`flex items-center gap-1 font-mono ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-primary">{formatNumber(timeLeft.days)}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Days</span>
      </div>
      <span className="text-primary font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-primary">{formatNumber(timeLeft.hours)}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Hrs</span>
      </div>
      <span className="text-primary font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-primary">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Min</span>
      </div>
      <span className="text-primary font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-primary">{formatNumber(timeLeft.seconds)}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Sec</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
