import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ChangeIndicatorProps {
  value: number;
  type: "positive" | "negative" | "neutral";
}

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({ value, type }) => {
  const colors = {
    positive: "bg-green-100 text-green-600",
    negative: "bg-red-100 text-red-600",
    neutral: "bg-amber-100 text-amber-600",
  };

  const icons = {
    positive: <TrendingUp className="mr-1 size-3" />,
    negative: <TrendingDown className="mr-1 size-3" />,
    neutral: <Minus className="mr-1 size-3" />,
  };

  return (
    <div
      className={`flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors[type]}`}
      style={{ fontSize: "calc(0.4rem + 0.3vw)" }}
    >
      {icons[type]}
      {value.toFixed(2)}%
    </div>
  );
};

export default ChangeIndicator;
