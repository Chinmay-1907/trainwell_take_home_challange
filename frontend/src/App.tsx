
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FunnelChart from "./components/FunnelChart";
import StepInput, { StepFormState } from "./components/StepInput";
import { FunnelStepResponse, runFunnel } from "./services/api";

const createStep = (): StepFormState => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10),
  hostname: "",
  path: "",
  label: ""
});

const formatDateParam = (value: Date) => value.toISOString().slice(0, 10);

const App = () => {
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const [startDate, setStartDate] = useState<Date | null>(ninetyDaysAgo);
  const [endDate, setEndDate] = useState<Date | null>(today);
  const [steps, setSteps] = useState<StepFormState[]>([createStep()]);
  const [results, setResults] = useState<FunnelStepResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStepChange = (
    id: string,
    field: keyof StepFormState,
    value: string
  ) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === id
          ? {
              ...step,
              [field]: value
            }
          : step
      )
    );
  };

  const handleAddStep = () => {
    setSteps((current) => [...current, createStep()]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps((current) => current.filter((step) => step.id !== id));
  };

  const handleRunFunnel = async () => {
    if (!startDate || !endDate) {
      setError("Select both a start and end date.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must be before the end date.");
      return;
    }

    const preparedSteps = steps
      .map(({ hostname, path, label }) => {
        const cleanedHostname = hostname.trim();
        const cleanedPath = path.trim();
        const cleanedLabel = label?.trim();

        return {
          hostname: cleanedHostname.length > 0 ? cleanedHostname : undefined,
          path: cleanedPath.length > 0 ? cleanedPath : undefined,
          label: cleanedLabel && cleanedLabel.length > 0 ? cleanedLabel : undefined
        };
      })
      .filter((step) => step.hostname || step.path);

    if (preparedSteps.length === 0) {
      setError("Add at least one step with a hostname and/or path.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
        steps: preparedSteps
      };
      const response = await runFunnel(payload);
      setResults(response);
    } catch (err) {
      console.error(err);
      setError("Could not fetch funnel data. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <section className="form-section">
        <div>
          <h1>Trainwell Funnel</h1>
          <p>Enter a date range and define steps to evaluate your conversion flow.</p>
        </div>

        <div className="date-inputs">
          <label className="field-group">
            <span>Start Date</span>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="text-input"
              maxDate={endDate ?? undefined}
              dateFormat="yyyy-MM-dd"
            />
          </label>
          <label className="field-group">
            <span>End Date</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              className="text-input"
              dateFormat="yyyy-MM-dd"
            />
          </label>
        </div>

        {/* Options removed per request */}

        <div className="steps-header">
          <h2>Funnel Steps</h2>
          <button type="button" className="run-button" onClick={handleAddStep}>
            + Add Step
          </button>
        </div>

        <div className="step-list">
          {steps.map((step, index) => (
            <StepInput
              key={step.id}
              step={step}
              index={index}
              onChange={handleStepChange}
              onRemove={handleRemoveStep}
              disableRemove={steps.length === 1}
            />
          ))}
        </div>

        <button
          type="button"
          className="run-button"
          onClick={handleRunFunnel}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Funnel"}
        </button>

        {error && <div className="error">{error}</div>}
      </section>

      {results && (
        <section className="results-section">
          <h2>Results</h2>
          {results.length === 0 ? (
            <p>No matching events found for the selected filters.</p>
          ) : (
            <>
              <FunnelChart data={results} />
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Users</th>
                    <th>Conversion %</th>
                    <th>Time to step (median / p95)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((step, index) => (
                    <tr key={step.label}>
                      <td>{`${index + 1}. ${step.label}`}</td>
                      <td>{step.users}</td>
                      <td>{step.conversion.toFixed(2)}</td>
                      <td>
                        {index === 0 || !step.timeToStep
                          ? "—"
                          : `${formatDuration(step.timeToStep.medianMs)} / ${formatDuration(
                              step.timeToStep.p95Ms
                            )}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default App;

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
