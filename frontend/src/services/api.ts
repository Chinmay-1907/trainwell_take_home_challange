import axios from "axios";

export interface FunnelStepRequest {
  hostname?: string;
  path?: string;
  label?: string;
}

export interface FunnelStepResponse {
  label: string;
  users: number;
  conversion: number;
}

export interface FunnelRequestBody {
  startDate: string;
  endDate: string;
  steps: FunnelStepRequest[];
}

export const runFunnel = async (
  payload: FunnelRequestBody
): Promise<FunnelStepResponse[]> => {
  const { data } = await axios.post<{ steps: FunnelStepResponse[] }>(
    "/api/funnel",
    payload
  );
  return data.steps;
};
