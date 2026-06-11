import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-700 bg-slate-800/50 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, className, action }: CardHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      {action}
    </div>
  );
}
