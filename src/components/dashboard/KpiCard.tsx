// src/components/dashboard/KpiCard.tsx
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function KpiCard({ title, value, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6">
      <div className="bg-brand-orange/10 p-4 rounded-full">
        <Icon className="text-brand-orange" size={28} />
      </div>
      <div>
        <h3 className="font-body text-sm text-gray-500">{title}</h3>
        {/* ALTERAÇÃO: de text-3xl para text-2xl */}
        <p className="font-display text-2xl font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}