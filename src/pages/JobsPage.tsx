import { BriefcaseBusiness, Clock3, House, MapPin, Plus, Search, ArrowRight, CircleHelp } from 'lucide-react';
import { useMemo, useState } from 'react';
import PageTitle from '../components/PageTitle';
import type { ToastFn } from '../types';

const jobs = [
  {
    role: 'FTTH Installation Technician',
    company: 'ISP Partner',
    location: 'Lagos · Field-based',
    type: 'Contract',
    level: 'Entry / Mid-level',
    icon: 'FI',
    description: 'Assist with customer fibre installations, ONT setup and optical power verification.',
  },
  {
    role: 'Fibre Optic Field Support',
    company: 'Network Services',
    location: 'Abuja · On-site',
    type: 'Full-time',
    level: 'Mid-level',
    icon: 'NS',
    description: 'Support field teams with troubleshooting, documentation and service restoration.',
  },
  {
    role: 'Optical Network Maintenance Assistant',
    company: 'Fibre Operations',
    location: 'Port Harcourt · Field-based',
    type: 'Contract',
    level: 'Entry-level',
    icon: 'FO',
    description: 'Help inspect fibre routes, record readings and escalate issues to senior technicians.',
  },
];

export default function JobsPage({ onToast }: { onToast: ToastFn }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      jobs.filter((j) =>
        `${j.role} ${j.company} ${j.location} ${j.type}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="FIELD NETWORK / COMMUNITY"
        title="Job listings"
        description="Explore a concept directory for fibre installation and field-service opportunities."
      />

      <div className="notice-banner">
        <BriefcaseBusiness size={18} />
        <div>
          <strong>Concept job board</strong>
          <span>
            Listings shown here are illustrative. Live vacancies, posting rights and application workflows need confirmation from the client.
          </span>
        </div>
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
        <button
          className="secondary-button"
          onClick={() =>
            onToast('Job posting needs client confirmation for who can post and manage vacancies.')
          }
        >
          <Plus size={16} /> Post a job
        </button>
      </div>

      <div className="jobs-grid">
        {filtered.map((job) => (
          <article className="job-card" key={job.role}>
            <div className="job-top">
              <div className="job-company-icon">{job.icon}</div>
            </div>
            <h3>{job.role}</h3>
            <p className="job-company">{job.company}</p>
            <p className="job-description">{job.description}</p>
            <div className="job-meta">
              <span>
                <MapPin size={14} />
                {job.location}
              </span>
              <span>
                <Clock3 size={14} />
                {job.type}
              </span>
            </div>
            <div className="job-bottom">
              <span>{job.level}</span>
              <button
                className="text-button"
                onClick={() => setSelected(selected === job.role ? null : job.role)}
              >
                {selected === job.role ? 'Hide details' : 'View details'} <ArrowRight size={14} />
              </button>
            </div>
            {selected === job.role && (
              <div className="job-detail">
                <strong>Role details</strong>
                <p>
                  {job.description} Confirm duties, pay, application contacts and closing dates with
                  the employer before acting on any listing.
                </p>
                <button
                  className="primary-button"
                  onClick={() =>
                    onToast('Application flow is not connected yet. Confirm process with the client.')
                  }
                >
                  Apply <ArrowRight size={15} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="panel empty-state">
          <Search size={25} />
          <strong>No matching listings</strong>
          <span>Try a different role or location.</span>
        </div>
      )}

      <div className="job-question panel">
        <div className="note-icon">
          <CircleHelp size={19} />
        </div>
        <div>
          <h3>Confirm the intended job workflow</h3>
          <p>
            Should this section show the owner&apos;s company vacancies, external fibre jobs, or allow
            employers and technicians to post and apply?
          </p>
        </div>
        <House size={18} />
      </div>
    </div>
  );
}
