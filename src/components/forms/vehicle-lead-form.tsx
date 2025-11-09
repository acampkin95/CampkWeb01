'use client';

import { useState } from 'react';

type Props = {
  vehicleId: string;
  vehicleTitle: string;
};

export function VehicleLeadForm({ vehicleId, vehicleTitle }: Props) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Hi, I am interested in ' + vehicleTitle + '. Please send more info.',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'vehicle', vehicleId, ...formState }),
      });
      if (!response.ok) {
        throw new Error('Unable to submit. Try again.');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Name
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Email
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Phone
        <input
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Message
        <textarea
          name="message"
          value={formState.message}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      {status === 'success' && <p className="text-sm text-emerald-600">Thanks – the sales desk has your enquiry.</p>}
      {status === 'error' && error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === 'submitting' ? 'Submitting...' : 'Reserve / Enquire'}
      </button>
    </form>
  );
}
