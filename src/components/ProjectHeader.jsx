import { project } from '../../shared/project.config.js';

function StatusPill({ label, ok, good, bad, loading }) {
  const state = loading ? 'loading' : ok ? 'ok' : 'warn';
  return (
    <span className={`pill ${state}`}>
      <span className="dot" aria-hidden="true" /> {label}: {loading ? 'checking...' : ok ? good : bad}
    </span>
  );
}

export default function ProjectHeader({ health }) {
  const team = project.teamMembers.map((member) => member.name).join(' · ');

  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="eyebrow">{team} · {project.community}</p>
        <h1>{project.appName}</h1>
        <p className="tagline">{project.tagline}</p>
        <div className="problem">
          <h2>The problem we're solving</h2>
          <p>{project.problemStatement}</p>
          <p className="for"><strong>For:</strong> {project.targetUser}</p>
        </div>
        <div className="pills" aria-label="Setup status">
          <StatusPill label="AI" ok={health?.ai === 'live'} good="Gemini live" bad="Safe guide mode" loading={!health} />
          <span className="pill ok"><span className="dot" aria-hidden="true" /> No personal data stored</span>
        </div>
      </div>
    </header>
  );
}
