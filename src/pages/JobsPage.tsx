import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { ToastFn } from '../types';

type Job = {
  id: string;
  owner_id: string | null;
  title: string;
  company: string;
  location: string;
  job_type: string;
  level: string;
  description: string;
  contact: string;
  created_at: string;
};

const SEED: Job[] = [
  {
    id: 'seed-1',
    owner_id: null,
    title: 'FTTH Installation Technician',
    company: 'FIBERLINK Field Services',
    location: 'Lagos · Field-based',
    job_type: 'Contract',
    level: 'Entry / Mid-level',
    description:
      'Assist with customer fibre installations, ONT setup and optical power verification.',
    contact: '',
    created_at: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'seed-2',
    owner_id: null,
    title: 'Fibre Optic Field Support',
    company: 'FIBERLINK Network Services',
    location: 'Abuja · On-site',
    job_type: 'Full-time',
    level: 'Mid-level',
    description: 'Support field teams with troubleshooting, documentation and service restoration.',
    contact: '',
    created_at: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'seed-3',
    owner_id: null,
    title: 'Optical Network Maintenance Assistant',
    company: 'FIBERLINK Fibre Operations',
    location: 'Port Harcourt · Field-based',
    job_type: 'Contract',
    level: 'Entry-level',
    description: 'Help inspect fibre routes, record readings and escalate issues to senior technicians.',
    contact: '',
    created_at: '2026-01-01T09:00:00.000Z',
  },
];

const EMPTY_DRAFT = {
  title: '',
  company: '',
  location: '',
  job_type: 'Full-time',
  level: 'Entry-level',
  description: '',
  contact: '',
};

const initialsOf = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return 'JB';
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('');
};

type Props = {
  onToast: ToastFn;
  onSignIn: () => void;
};

const JobsPage = ({ onToast, onSignIn }: Props) => {
  const { user, signOut } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(SEED);
  const [loadingJobs, setLoadingJobs] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const loadJobs = async () => {
    if (!supabase) {
      setJobs(SEED);
      setLoadingJobs(false);
      return;
    }
    setLoadingJobs(true);
    setLoadError('');
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs((data as Job[]) ?? []);
    } catch (err) {
      setJobs(SEED);
      setLoadError(err instanceof Error ? err.message : 'Could not load listings.');
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        const matchesQuery = `${j.title} ${j.company} ${j.location} ${j.job_type}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || j.job_type === typeFilter;
        return matchesQuery && matchesType;
      }),
    [jobs, search, typeFilter]
  );

  const isOwner = (job: Job) => Boolean(user && job.owner_id && job.owner_id === user.id);

  const openPost = () => {
    if (!user) {
      onSignIn();
      return;
    }
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingId(job.id);
    setDraft({
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      level: job.level,
      description: job.description,
      contact: job.contact,
    });
    setFormError('');
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!supabase || !user) return;
    if (!draft.title.trim() || !draft.company.trim() || !draft.description.trim()) {
      setFormError('Title, company and description are required.');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      if (editingId) {
        const { error } = await supabase
          .from('jobs')
          .update({
            title: draft.title.trim(),
            company: draft.company.trim(),
            location: draft.location.trim(),
            job_type: draft.job_type,
            level: draft.level,
            description: draft.description.trim(),
            contact: draft.contact.trim(),
          })
          .eq('id', editingId)
          .eq('owner_id', user.id);
        if (error) throw error;
        onToast('Listing updated.');
      } else {
        const { error } = await supabase.from('jobs').insert({
          owner_id: user.id,
          title: draft.title.trim(),
          company: draft.company.trim(),
          location: draft.location.trim(),
          job_type: draft.job_type,
          level: draft.level,
          description: draft.description.trim(),
          contact: draft.contact.trim(),
        });
        if (error) throw error;
        onToast('Job posted to the community board.');
      }
      setFormOpen(false);
      await loadJobs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save the listing.');
    } finally {
      setBusy(false);
    }
  };

  const removeJob = async (job: Job) => {
    if (!supabase || !user) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id)
        .eq('owner_id', user.id);
      if (error) throw error;
      onToast('Listing removed.');
      await loadJobs();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not remove the listing.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onToast('Signed out.');
    } catch {
      onToast('Could not sign out. Try again.');
    }
  };

  return (
    <div className="page-stack">
      <div className="page-title">
        <span className="eyebrow">FIELD NETWORK · COMMUNITY</span>
        <h1>Job listings</h1>
        <p>Explore fibre installation and field-service opportunities across the network.</p>
      </div>

      <div className="jobs-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or locations"
            aria-label="Search jobs"
          />
        </label>
        <select
          className="text-input jobs-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by job type"
        >
          <option value="all">All types</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
          <option value="Part-time">Part-time</option>
        </select>
        <button className="secondary-button" onClick={openPost}>
          <Plus size={16} /> Post a job
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="notice-banner">
          <BriefcaseBusiness size={18} />
          <div>
            <strong>Backend not connected</strong>
            <span>
              Showing sample listings. Connect Supabase (see the README) and sign in to post your
              own jobs.
            </span>
          </div>
        </div>
      )}

      {isSupabaseConfigured && loadError && (
        <div className="notice-banner">
          <BriefcaseBusiness size={18} />
          <div>
            <strong>Could not load live listings</strong>
            <span>{loadError}</span>
          </div>
        </div>
      )}

      <div className="jobs-account-bar">
        {user ? (
          <>
            <span className="jobs-account-chip">
              <User size={14} /> {user.email}
            </span>
            <button className="text-button" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <span className="jobs-account-hint">
            Browsing as a guest · sign in to post or manage listings
          </span>
        )}
      </div>

      {loadingJobs ? (
        <div className="jobs-empty">Loading listings…</div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-top">
                <div className="job-company-icon">{initialsOf(job.company)}</div>
                {isOwner(job) && (
                  <div className="job-owner-actions">
                    <button className="text-button" onClick={() => openEdit(job)} aria-label="Edit listing">
                      <Pencil size={13} />
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() => removeJob(job)}
                      disabled={busy}
                      aria-label="Delete listing"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-description">{job.description}</p>
              <div className="job-meta">
                <span>
                  <MapPin size={14} />
                  {job.location}
                </span>
                <span>
                  <Clock3 size={14} />
                  {job.job_type}
                </span>
              </div>
              <div className="job-bottom">
                <span>{job.level}</span>
                <button
                  className="text-button"
                  onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}
                >
                  {selectedId === job.id ? 'Hide details' : 'View details'} <ArrowRight size={14} />
                </button>
              </div>
              {selectedId === job.id && (
                <div className="job-detail">
                  <strong>Role details</strong>
                  <p>{job.description}</p>
                  {job.contact && (
                    <p>
                      <strong>Contact:</strong> {job.contact}
                    </p>
                  )}
                  <button
                    className="text-button"
                    onClick={() =>
                      onToast(
                        job.contact
                          ? `Send your application to ${job.contact}.`
                          : 'Application details will be shared with the hiring partner.'
                      )
                    }
                  >
                    Apply <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </article>
          ))}
          {!loadingJobs && filtered.length === 0 && (
            <div className="jobs-empty">No listings match your search.</div>
          )}
        </div>
      )}

      {formOpen && (
        <div className="install-guide-backdrop" role="presentation" onClick={() => setFormOpen(false)}>
          <section
            className="auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">JOB LISTINGS</p>
            <h2 id="job-form-title">{editingId ? 'Edit listing' : 'Post a job'}</h2>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submitForm();
              }}
            >
              <div className="job-form-grid">
                <div>
                  <label className="field-label" htmlFor="job-title">Job title</label>
                  <input
                    id="job-title"
                    className="text-input"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Fibre Splicing Technician"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="job-company">Company</label>
                  <input
                    id="job-company"
                    className="text-input"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                    placeholder="e.g. FIBERLINK Field Services"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="job-location">Location</label>
                  <input
                    id="job-location"
                    className="text-input"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="e.g. Lagos · Field-based"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="job-type">Job type</label>
                  <select
                    id="job-type"
                    className="text-input"
                    value={draft.job_type}
                    onChange={(e) => setDraft({ ...draft, job_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="job-level">Level</label>
                  <select
                    id="job-level"
                    className="text-input"
                    value={draft.level}
                    onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Entry / Mid-level">Entry / Mid-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior-level">Senior-level</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="job-contact">Contact email</label>
                  <input
                    id="job-contact"
                    className="text-input"
                    value={draft.contact}
                    onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                    placeholder="Optional · jobs@yourcompany.com"
                  />
                </div>
              </div>

              <div className="job-form-full">
                <label className="field-label" htmlFor="job-description">Description</label>
                <textarea
                  id="job-description"
                  className="text-input job-textarea"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Describe the role, duties and requirements…"
                />
              </div>

              {formError && <p className="auth-error">{formError}</p>}

              <div className="btn-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? 'Saving…' : editingId ? 'Save changes' : 'Post listing'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
