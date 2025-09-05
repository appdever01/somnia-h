import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ title, value, icon, className = "" }: StatCardProps) {
  return (
    <div className={`bg-[#FFFFFF33] rounded-lg p-4 flex items-center gap-4 ${className}`}>
      {icon && (
        <div className="bg-[#FFFFFF33] rounded-full p-2 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <p className="font-unkempt text-sm text-white opacity-80">{title}</p>
        <p className="font-rubik text-xl sm:text-2xl lg:text-3xl text-white">{value}</p>
      </div>
    </div>
  );
} 