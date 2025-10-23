import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList
} from "recharts";
import { FunnelStepResponse } from "../services/api";

interface FunnelChartProps {
  data: FunnelStepResponse[];
}

const FunnelChart = ({ data }: FunnelChartProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 24, bottom: 32, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "conversion") {
                return [`${value}%`, "Conversion"];
              }
              return [value, "Users"];
            }}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="users" fill="#2563eb" radius={[8, 8, 0, 0]}>
            <LabelList dataKey="users" position="top" formatter={(value: number) => value.toString()} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FunnelChart;
