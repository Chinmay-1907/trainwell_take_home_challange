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
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="users" fill="#2563eb" radius={[8, 8, 0, 0]}>
            <LabelList dataKey="users" position="top" formatter={(value: number) => value.toString()} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FunnelChart;

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remS = sec % 60;
  if (min < 60) return remS ? `${min}m ${remS}s` : `${min}m`;
  const hr = Math.floor(min / 60);
  const remM = min % 60;
  return remM ? `${hr}h ${remM}m` : `${hr}h`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload as FunnelStepResponse | undefined;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", padding: 8, borderRadius: 6 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>Users: {item?.users ?? "-"}</div>
      {item && item.timeToStep && (
        <div style={{ marginTop: 4, color: "#374151" }}>
          <div>Median to step: {formatDuration(item.timeToStep.medianMs)}</div>
          <div>p95 to step: {formatDuration(item.timeToStep.p95Ms)}</div>
        </div>
      )}
    </div>
  );
}
