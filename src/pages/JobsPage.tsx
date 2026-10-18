import { ArrowRight, BriefcaseBusiness, Clock3, MapPin, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ToastFn } from '../types';

type Job = {
  role: string;
  company: string;
  location: string;
  type: string;
  level: string;
  icon: string;
  description: string;
};

const jobs: Job[] = [
  {
    role: 'FTTH Installation Technician',
    company: 'FIBERLINK Field Services',
    location: 'Lagos · Field-based',
    type: 'Contract',
    level: 'Entry / Mid-level',
    icon: 'FF',
    description:
      'Assist with customer fibre installations, ONT setup and optical power verification.',
  },
  {
    role: 'Fibre Optic Field Support',
    company: 'FIBERLINK Network Services',
    location: 'Abuja · On-site',
    type: 'Full-time',
    level: 'Mid-level',
    icon: 'FN',
    description:
      'Support field teams with troubleshooting, documentation and service restoration.',
  },
  {
    role: 'Optical Network Maintenance Assistant',
    company: 'FIBERLINK Fibre Operations',
    location: 'Port Harcourt · Field-based',
    type: 'Contract',
    level: 'Entry-level',
    icon: 'FO',
    description:
      'Help inspect fibre routes, record readings and escalate issues to senior technicians.',
  },
];

const JobsPage = ({ onToast }: { onToast: ToastFn }) => {
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
        <button
          className="secondary-button"
          onClick={() =>
            onToast('Job posting is available to network partners. Contact FIBERLINKGUARD to post.')
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
                <p>{job.description}</p>
                <button
                  className="text-button"
                  onClick={() => onToast('Application details will be shared with the hiring partner.')}
                >
                  Apply <ArrowRight size={14} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="notice-banner">
        <BriefcaseBusiness size={18} />
        <div>
          <strong>Network partner listings</strong>
          <span>
            Roles are posted by verified FIBERLINKGUARD network partners. Contact support to list
            your company.
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
