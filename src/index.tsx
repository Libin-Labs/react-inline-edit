'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
export interface InlineEditProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSave?: (
    value: string,
    options: {
      signal: AbortSignal;
    },
  ) => void | Promise<void>;
  validate?: (value: string) => string | undefined;
  maxLength?: number;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  renderDisplay?: (value: string) => ReactNode;
  className?: string;
}
export function InlineEdit({
  value: controlled,
  defaultValue = '',
  onChange,
  onSave,
  validate,
  maxLength = 10000,
  disabled = false,
  label = 'Edit text',
  placeholder = 'Empty',
  renderDisplay,
  className,
}: InlineEditProps) {
  if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 1048576)
    throw new RangeError('maxLength must be 1..1048576.');
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (editing) {
      input.current?.focus();
      input.current?.select();
    }
  }, [editing]);
  const cancel = () => {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
    setEditing(false);
    setDraft(value);
    setError(null);
    button.current?.focus();
  };
  const save = async () => {
    if (controller.current || disabled) return;
    const failure = draft.length > maxLength ? 'Text limit exceeded.' : validate?.(draft);
    if (failure) {
      setError(failure);
      return;
    }
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError(null);
    try {
      await onSave?.(draft, { signal: active.signal });
      if (!alive.current || active.signal.aborted) return;
      if (controlled === undefined) setInternal(draft);
      onChange?.(draft);
      setEditing(false);
      button.current?.focus();
    } catch (reason) {
      if (alive.current && !active.signal.aborted)
        setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (controller.current === active) {
        controller.current = null;
        if (alive.current) setBusy(false);
      }
    }
  };
  return (
    <span className={className}>
      <button
        ref={button}
        type="button"
        hidden={editing}
        disabled={disabled}
        aria-label={label}
        onClick={() => {
          setDraft(value);
          setError(null);
          setEditing(true);
        }}
      >
        {renderDisplay ? renderDisplay(value) : value || placeholder}
      </button>
      {editing && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              cancel();
            }
          }}
          style={{ display: 'inline-flex', gap: 4 }}
        >
          <input
            ref={input}
            aria-label={label}
            aria-invalid={Boolean(error)}
            value={draft}
            maxLength={maxLength}
            disabled={busy}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
          <button type="submit" disabled={busy}>
            Save
          </button>
          <button type="button" onClick={cancel}>
            Cancel
          </button>
        </form>
      )}
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
export default InlineEdit;
