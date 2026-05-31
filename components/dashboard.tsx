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
  city: string;
  region: string;
  websiteUrl: string | null;
  rating: number | null;
  confidenceScore: number;
  confidenceLabel: 'high' | 'medium' | 'low';
  mapsUrl: string;
  openNow: boolean | null;
}
type ResultSort = 'confidence-desc' | 'confidence-asc' | 'rating-desc' | 'name-asc';

const defaultTokenHint = 'Authenticate to create and run searches.';
const defaultActionHint = 'Create a job, run it, and export results when ready.';
const resultsTableColumnCount = 9;
const initialForm = {
  locationName: 'Springfield, IL',
  latitude: 39.799,
  longitude: -89.644,
  radius: 5000,
  category: 'Bakery',
  keywords: '',
  requireNoWebsite: true,
};

async function parseMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBusy, setIsBusy] = useState({
    login: false,
    creatingJob: false,
    loadingJobs: false,
    runningJob: false,
    loadingResults: false,
    exporting: false,
  });
  const [authStatusMessage, setAuthStatusMessage] = useState(defaultTokenHint);
  const [actionMessage, setActionMessage] = useState(defaultActionHint);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [results, setResults] = useState<Business[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<ResultSort>('confidence-desc');
  const [filters, setFilters] = useState({
    category: '',
    confidence: '',
    minRating: '',
    openNow: '',
    requireNoWebsite: true,
  });
  const [form, setForm] = useState(initialForm);

  async function loadJobs() {
    setIsBusy((current) => ({ ...current, loadingJobs: true }));
    const response = await fetch('/api/search/jobs');
    setIsBusy((current) => ({ ...current, loadingJobs: false }));
    if (!response.ok) {
      const message = await parseMessage(response, 'Could not load jobs');
      setActionMessage(message);
      return;
    }
    const payload = (await response.json()).data as SearchJob[];
    setJobs(payload);
    if (!selectedJobId && payload[0]) {
      setSelectedJobId(payload[0].id);
    }
  }

  async function loadResults(jobId: string) {
    setIsBusy((current) => ({ ...current, loadingResults: true }));
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.confidence) params.set('confidence', filters.confidence);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.openNow) params.set('openNow', filters.openNow);
    params.set('requireNoWebsite', String(filters.requireNoWebsite));

    const response = await fetch(`/api/search/jobs/${jobId}/results?${params.toString()}`);
    setIsBusy((current) => ({ ...current, loadingResults: false }));
    if (!response.ok) {
      const message = await parseMessage(response, 'Could not load search results');
      setActionMessage(message);
      return;
    }
    setResults((await response.json()).data as Business[]);
  }

  const filteredResults = useMemo(
    () =>
      results.filter((item) => {
        if (query) {
          const normalizedQuery = query.trim().toLowerCase();
          const hasMatch = [item.name, item.address, item.phone, item.city, item.region].some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(normalizedQuery),
          );
          if (!hasMatch) return false;
        }
        if (filters.minRating && (item.rating ?? 0) < Number(filters.minRating)) return false;
        if (filters.confidence && item.confidenceScore < Number(filters.confidence)) return false;
        if (filters.openNow) {
          const openNowFilter = filters.openNow === 'open';
          if (item.openNow !== openNowFilter) return false;
        }
        if (filters.requireNoWebsite && item.websiteUrl) return false;
        return true;
      }),
    [filters.confidence, filters.minRating, filters.openNow, filters.requireNoWebsite, query, results],
  );

  const sortedResults = useMemo(() => {
    const items = [...filteredResults];
    switch (sortBy) {
      case 'confidence-asc':
        return items.sort((a, b) => a.confidenceScore - b.confidenceScore);
      case 'rating-desc':
        return items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'name-asc':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'confidence-desc':
      default:
        return items.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }
  }, [filteredResults, sortBy]);

  const uniqueResultCategories = useMemo(
    () => [...new Set(results.map((item) => item.category))].sort((a, b) => a.localeCompare(b)),
    [results],
  );

  const summary = useMemo(() => {
    const total = sortedResults.length;
    const highConfidence = sortedResults.filter((item) => item.confidenceScore >= 90).length;
    const openNow = sortedResults.filter((item) => item.openNow === true).length;
    const withNoWebsite = sortedResults.filter((item) => !item.websiteUrl).length;
    return { total, highConfidence, openNow, withNoWebsite };
  }, [sortedResults]);

  async function login() {
    if (!credentials.email || !credentials.password) {
      setAuthStatusMessage('Email and password are required');
      return;
    }

    setIsBusy((current) => ({ ...current, login: true }));
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    setIsBusy((current) => ({ ...current, login: false }));
    if (!res.ok) {
      const message = await parseMessage(res, 'Authentication failed');
      setAuthStatusMessage(message);
      return;
    }

    setIsAuthenticated(true);
    setAuthStatusMessage('Authenticated');
    setActionMessage('Session started. Create or run a job to view results.');
    await loadJobs();
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      setActionMessage('Log in before creating a search job.');
      return;
    }

    setIsBusy((current) => ({ ...current, creatingJob: true }));
    const res = await fetch('/api/search/jobs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });

    setIsBusy((current) => ({ ...current, creatingJob: false }));
    if (!res.ok) {
      const message = await parseMessage(res, 'Could not create search job');
      setActionMessage(message);
      return;
    }

    const payload = (await res.json()).data as SearchJob;
    setJobs((current) => [payload, ...current]);
    setSelectedJobId(payload.id);
    setForm(initialForm);
    setActionMessage('Search job created. Run it to generate fresh leads.');
  }

  async function runJob(jobId: string) {
    if (!isAuthenticated) {
      setActionMessage('Log in before running a search job.');
      return;
    }

    setIsBusy((current) => ({ ...current, runningJob: true }));
    const runResponse = await fetch(`/api/search/jobs/${jobId}/run`, { method: 'POST' });
    setIsBusy((current) => ({ ...current, runningJob: false }));
    if (!runResponse.ok) {
      const message = await parseMessage(runResponse, 'Search run failed');
      setActionMessage(message);
      return;
    }

    await loadJobs();
    setSelectedJobId(jobId);
    await loadResults(jobId);
    setActionMessage('Search completed. Results have been refreshed.');
  }

  async function exportCsv() {
    if (!selectedJobId) {
      setActionMessage('No search jobs available to export');
      return;
    }

    setIsBusy((current) => ({ ...current, exporting: true }));
    const res = await fetch('/api/exports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        searchJobId: selectedJobId,
        filters: {
          category: filters.category || undefined,
          confidence: filters.confidence ? Number(filters.confidence) : undefined,
          minRating: filters.minRating ? Number(filters.minRating) : undefined,
          openNow: filters.openNow ? filters.openNow === 'open' : undefined,
          requireNoWebsite: filters.requireNoWebsite,
        },
      }),
    });

    setIsBusy((current) => ({ ...current, exporting: false }));
    if (!res.ok) {
      const message = await parseMessage(res, 'Could not export CSV');
      setActionMessage(message);
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

  function clearResultFilters() {
    setQuery('');
    setFilters((current) => ({
      ...current,
      category: '',
      confidence: '',
      minRating: '',
      openNow: '',
      requireNoWebsite: true,
    }));
  }

  async function refreshResultsForSelection() {
    if (!selectedJobId) {
      setActionMessage('Select or create a job first.');
      return;
    }
    await loadResults(selectedJobId);
    setActionMessage('Results refreshed.');
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
            type="email"
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
            {isBusy.login ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </header>

      <p className="text-xs text-gray-500">{authStatusMessage}</p>
      {actionMessage ? <p className="text-xs text-gray-600">{actionMessage}</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <article className="rounded border bg-white p-3">
          <p className="text-xs text-gray-500">Visible results</p>
          <p className="text-lg font-semibold">{summary.total}</p>
        </article>
        <article className="rounded border bg-white p-3">
          <p className="text-xs text-gray-500">High confidence</p>
          <p className="text-lg font-semibold">{summary.highConfidence}</p>
        </article>
        <article className="rounded border bg-white p-3">
          <p className="text-xs text-gray-500">Open now</p>
          <p className="text-lg font-semibold">{summary.openNow}</p>
        </article>
        <article className="rounded border bg-white p-3">
          <p className="text-xs text-gray-500">No website</p>
          <p className="text-lg font-semibold">{summary.withNoWebsite}</p>
        </article>
      </div>

      <section className="rounded border p-4">
        <h2 className="font-medium mb-3">Create Search Job</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={createJob}>
          <input
            className="rounded border p-2"
            aria-label="Search location"
            value={form.locationName}
            onChange={(e) => setForm({ ...form, locationName: e.target.value })}
          />
          <input className="rounded border p-2" aria-label="Business category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="rounded border p-2" type="number" min={1} max={50000} aria-label="Search radius in meters" value={form.radius} onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })} />
          <input
            className="rounded border p-2"
            type="number"
            step="0.0001"
            aria-label="Latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
          />
          <input
            className="rounded border p-2"
            type="number"
            step="0.0001"
            aria-label="Longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
          />
          <input
            className="rounded border p-2"
            aria-label="Search keywords"
            placeholder="Keywords (optional)"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm md:col-span-3">
            <input
              type="checkbox"
              checked={form.requireNoWebsite}
              onChange={(e) => setForm({ ...form, requireNoWebsite: e.target.checked })}
            />
            Require businesses without websites
          </label>
          <button className="rounded bg-blue-600 px-4 py-2 text-white md:col-span-3" type="submit">
            {isBusy.creatingJob ? 'Saving...' : 'Save Job'}
          </button>
        </form>
      </section>

      <section className="rounded border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-medium">Search Jobs</h2>
          <button onClick={loadJobs} className="rounded border px-3 py-1.5 text-sm">
            {isBusy.loadingJobs ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex flex-col md:flex-row md:items-center md:justify-between rounded border p-3 gap-2 bg-white">
                <p className="text-sm">
                  <span className="font-medium">{job.category}</span> in {job.locationName} • {job.radius}m • {job.status}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedJobId(job.id);
                      loadResults(job.id).catch((error: unknown) => {
                        setActionMessage(error instanceof Error ? error.message : 'Could not load search results');
                      });
                    }}
                    className="rounded border px-3 py-1.5 text-sm"
                  >
                    View Results
                  </button>
                  <button onClick={() => runJob(job.id)} className="rounded bg-emerald-600 px-3 py-1.5 text-white text-sm">
                    {isBusy.runningJob ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="font-medium">Results</h2>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded border p-2 text-sm"
              aria-label="Select search job"
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setActionMessage('Load results to view data for the selected job.');
              }}
            >
              <option value="">Select job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.category} · {job.locationName}
                </option>
              ))}
            </select>
            <button onClick={refreshResultsForSelection} className="rounded border px-3 py-1.5 text-sm">
              {isBusy.loadingResults ? 'Loading...' : 'Load Results'}
            </button>
            <select
              className="rounded border p-2 text-sm"
              aria-label="Filter by category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All categories</option>
              {uniqueResultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="rounded border p-2 text-sm"
              aria-label="Filter by confidence level"
              value={filters.confidence}
              onChange={(e) => setFilters({ ...filters, confidence: e.target.value })}
            >
              <option value="">Any confidence</option>
              <option value="90">High (90+)</option>
              <option value="75">Medium (75+)</option>
            </select>
            <select
              className="rounded border p-2 text-sm"
              aria-label="Filter by minimum rating"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            >
              <option value="">Any rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
            </select>
            <select
              className="rounded border p-2 text-sm"
              aria-label="Filter by open status"
              value={filters.openNow}
              onChange={(e) => setFilters({ ...filters, openNow: e.target.value })}
            >
              <option value="">Any open status</option>
              <option value="open">Open now</option>
              <option value="closed">Closed now</option>
            </select>
            <select
              className="rounded border p-2 text-sm"
              aria-label="Sort results"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ResultSort)}
            >
              <option value="confidence-desc">Confidence (high to low)</option>
              <option value="confidence-asc">Confidence (low to high)</option>
              <option value="rating-desc">Rating (high to low)</option>
              <option value="name-asc">Name (A to Z)</option>
            </select>
            <label className="flex items-center gap-2 rounded border px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={filters.requireNoWebsite}
                onChange={(e) => setFilters({ ...filters, requireNoWebsite: e.target.checked })}
              />
              No website only
            </label>
            <input
              className="rounded border p-2 text-sm"
              placeholder="Search name, address, phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={clearResultFilters} className="rounded border px-3 py-1.5 text-sm">
              Reset filters
            </button>
            <button onClick={exportCsv} className="rounded bg-purple-600 px-3 py-1.5 text-white text-sm">
              {isBusy.exporting ? 'Exporting...' : 'Export CSV'}
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
                <th>Rating</th>
                <th>Confidence</th>
                <th>Open</th>
                <th>Website</th>
                <th>Maps</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.length === 0 ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={resultsTableColumnCount}>
                    No results.
                  </td>
                </tr>
              ) : (
                sortedResults.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.address}</td>
                    <td>{item.phone}</td>
                    <td>{item.rating ?? 'N/A'}</td>
                    <td>
                      {item.confidenceScore} ({item.confidenceLabel})
                    </td>
                    <td>{item.openNow === null ? 'Unknown' : item.openNow ? 'Open' : 'Closed'}</td>
                    <td>
                      {item.websiteUrl ? (
                        <a href={item.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                          Visit
                        </a>
                      ) : (
                        'None'
                      )}
                    </td>
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
