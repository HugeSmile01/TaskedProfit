'use client';

import { FormEvent, useMemo, useState } from 'react';

interface SearchJob {
  id: string;
  category: string;
  locationName: string;
  radius: number;
  status: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  confidenceScore: number;
  mapsUrl: string;
  openNow: boolean | null;
}

const defaultTokenHint = 'Authenticate to create and run searches.';

export default function Dashboard() {
  const [authStatusMessage, setAuthStatusMessage] = useState(defaultTokenHint);
  const [actionMessage, setActionMessage] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [results, setResults] = useState<Business[]>([]);
  const [filters, setFilters] = useState({ category: '', confidence: '' });
  const [form, setForm] = useState({
    locationName: 'Springfield, IL',
    latitude: 39.799,
    longitude: -89.644,
    radius: 5000,
    category: 'Bakery',
    keywords: '',
    requireNoWebsite: true,
  });

  const filteredResults = useMemo(
    () =>
      results.filter((item) => {
        if (filters.category && item.category !== filters.category) return false;
        if (filters.confidence && item.confidenceScore < Number(filters.confidence)) return false;
        return true;
      }),
    [filters, results],
  );

  async function login() {
    if (!credentials.email || !credentials.password) {
      setAuthStatusMessage('Email and password are required');
      return;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    setAuthStatusMessage(res.ok ? 'Authenticated' : 'Authentication failed');
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await fetch('/api/search/jobs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setActionMessage('Could not create search job');
      return;
    }

    const payload = (await res.json()).data as SearchJob;
    setJobs((current) => [payload, ...current]);
    setActionMessage('Search job created');
  }

  async function runJob(jobId: string) {
    await fetch(`/api/search/jobs/${jobId}/run`, { method: 'POST' });
    const jobsRes = await fetch('/api/search/jobs');
    if (jobsRes.ok) {
      const payload = (await jobsRes.json()).data as SearchJob[];
      setJobs(payload);
    }

    const resultRes = await fetch(`/api/search/jobs/${jobId}/results`);
    if (resultRes.ok) {
      setResults((await resultRes.json()).data as Business[]);
    }
  }

  async function exportCsv() {
    if (!jobs[0]) {
      setActionMessage('No search jobs available to export');
      return;
    }

    const res = await fetch('/api/exports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ searchJobId: jobs[0].id, filters: { ...filters } }),
    });

    if (!res.ok) {
      setActionMessage('Could not export CSV');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskedprofit-results.csv';
    link.click();
    URL.revokeObjectURL(url);
    setActionMessage('CSV export downloaded');
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">TaskedProfit</h1>
          <p className="text-sm text-gray-600">Find active businesses without websites.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            className="rounded border p-2 text-sm"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials((current) => ({ ...current, email: e.target.value }))}
          />
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            className="rounded border p-2 text-sm"
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials((current) => ({ ...current, password: e.target.value }))}
          />
          <button onClick={login} className="rounded bg-black px-4 py-2 text-white">
            Login
          </button>
        </div>
      </header>

      <p className="text-xs text-gray-500">{authStatusMessage}</p>
      {actionMessage ? <p className="text-xs text-gray-600">{actionMessage}</p> : null}

      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Create Search Job</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={createJob}>
          <input className="rounded border p-2" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
          <input className="rounded border p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="rounded border p-2" type="number" value={form.radius} onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })} />
          <button className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-3" type="submit">
            Save Job
          </button>
        </form>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Search Jobs</h2>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex flex-col md:flex-row md:items-center md:justify-between rounded border p-3 gap-2">
                <p className="text-sm">
                  <span className="font-medium">{job.category}</span> in {job.locationName} • {job.radius}m • {job.status}
                </p>
                <button onClick={() => runJob(job.id)} className="rounded bg-emerald-600 px-3 py-1.5 text-white text-sm">
                  Run
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="font-medium">Results</h2>
          <div className="flex gap-2">
            <select className="rounded border p-2 text-sm" value={filters.confidence} onChange={(e) => setFilters({ ...filters, confidence: e.target.value })}>
              <option value="">Any confidence</option>
              <option value="90">High (90+)</option>
              <option value="75">Medium (75+)</option>
            </select>
            <button onClick={exportCsv} className="rounded bg-purple-600 px-3 py-1.5 text-white text-sm">
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Category</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Confidence</th>
                <th>Open</th>
                <th>Maps</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={7}>
                    No results.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.address}</td>
                    <td>{item.phone}</td>
                    <td>{item.confidenceScore}</td>
                    <td>{item.openNow === null ? 'Unknown' : item.openNow ? 'Open' : 'Closed'}</td>
                    <td>
                      <a href={item.mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
