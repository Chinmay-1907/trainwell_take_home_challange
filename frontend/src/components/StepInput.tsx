import { ChangeEvent } from "react";

export interface StepFormState {
  id: string;
  label: string;
  hostname: string;
  path: string;
}

interface StepInputProps {
  step: StepFormState;
  index: number;
  onChange: (id: string, field: keyof StepFormState, value: string) => void;
  onRemove: (id: string) => void;
  disableRemove: boolean;
}

const StepInput = ({
  step,
  index,
  onChange,
  onRemove,
  disableRemove
}: StepInputProps) => {
  const handleChange =
    (field: keyof StepFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      onChange(step.id, field, event.target.value);
    };

  return (
    <div className="step-row">
      <div className="step-number">{index + 1}</div>
      <div className="step-fields">
        <label className="field-group">
          <span>Label (optional)</span>
          <input
            className="text-input"
            placeholder="Splash Page"
            value={step.label}
            onChange={handleChange("label")}
          />
        </label>
        <label className="field-group">
          <span>Hostname</span>
          <input
            className="text-input"
            placeholder="join.trainwell.net"
            value={step.hostname}
            onChange={handleChange("hostname")}
          />
        </label>
        <label className="field-group">
          <span>Path</span>
          <input
            className="text-input"
            placeholder="/plan"
            value={step.path}
            onChange={handleChange("path")}
          />
        </label>
      </div>
      <button
        type="button"
        className="remove-button"
        onClick={() => onRemove(step.id)}
        disabled={disableRemove}
        aria-label={`Remove step ${index + 1}`}
      >
        -
      </button>
    </div>
  );
};

export default StepInput;
