import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import './styles.css';

const TEAM_NAMES = {
  pharmacy: 'Pharmacy team',
  prescriber: 'Prescriber',
  insurance: 'Insurance company',
};

export default function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [answer, setAnswer] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const issueHeadingRef = useRef(null);

  const loadIssues = useCallback(async () => {
    setIssuesLoading(true);
    setIssuesError(false);
    try {
      const data = await api.issues();
      setIssues(Array.isArray(data?.issues) ? data.issues : []);
    } catch {
      setIssuesError(true);
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.health()
      .then((data) => {
        if (active) {
          setHealth(data);
          setHealthError(false);
        }
      })
      .catch(() => {
        if (active) setHealthError(true);
      });
    loadIssues();
    return () => { active = false; };
  }, [loadIssues]);

  async function explainSelectedIssue() {
    if (!selectedIssue || explainLoading) return;
    setExplainLoading(true);
    setExplainError(false);
    setAnswer(null);
    setCopyMessage('');
    try {
      const result = await api.explain(selectedIssue);
      setAnswer(result);
    } catch {
      setExplainError(true);
    } finally {
      setExplainLoading(false);
    }
  }

  function tryAnotherIssue() {
    setAnswer(null);
    setExplainError(false);
    setSelectedIssue('');
    setCopyMessage('');
    requestAnimationFrame(() => issueHeadingRef.current?.focus());
  }

  async function copySummary() {
    if (!answer) return;
    const steps = (answer.nextSteps || []).slice(0, 3);
    const questions = (answer.questions || []).slice(0, 3);
    const summary = [
      answer.title,
      '',
      answer.explanation,
      '',
      `Who to contact: ${TEAM_NAMES[answer.contact?.team] || answer.contact?.team || ''}`,
      answer.contact?.reason || '',
      '',
      'Three next steps:',
      ...steps.map((step, index) => `${index + 1}. ${step}`),
      '',
      'Questions to ask:',
      ...questions.map((question) => `• ${question}`),
      '',
      answer.disclaimer || '',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopyMessage('Summary copied.');
    } catch {
      setCopyMessage('Copy is unavailable in this browser. You can print the summary instead.');
    }
  }

  const aiState = healthError ? 'error' : health?.ai;
  const answerReady = Boolean(answer);

  return (
    <div className={`page-shell${largeText ? ' large-text' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" aria-label="Rxplain home">
            <span className="brand-mark" aria-hidden="true">Rx</span>
            <span className="brand-name">Rx<span>plain</span></span>
          </a>
          <div className="privacy-note">
            <span className="privacy-mark" aria-hidden="true" />
            No personal or prescription details needed
          </div>
        </div>
      </header>

      <main className="main-wrap">
        <section className="intro" aria-labelledby="page-title">
          <p className="kicker">A clearer way forward</p>
          <h1 id="page-title">Prescription pickup<br className="desktop-break" /> got complicated?</h1>
          <p className="intro-copy">Choose the issue that sounds familiar. We’ll explain what it may mean and who can help with next steps.</p>
          <p className="intro-safety"><span className="shield" aria-hidden="true">◆</span> No names, medication details, or insurance information</p>
        </section>

        <div className="workspace">
          <section className="panel select-panel" aria-labelledby="issue-heading">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <span className="step-tag" aria-hidden="true">1</span>
                <div>
                  <h2 id="issue-heading" ref={issueHeadingRef} tabIndex="-1">Choose an issue</h2>
                  <p>Select the closest match to what happened.</p>
                </div>
              </div>
              {!issuesLoading && !issuesError && <span className="option-count">{issues.length} options</span>}
            </div>

            {issuesLoading && (
              <div className="issue-loading" role="status" aria-label="Loading issue options">
                {[0, 1, 2, 3, 4].map((item) => <div className="issue-skeleton" key={item} />)}
              </div>
            )}
            {issuesError && (
              <div className="inline-error" role="alert">
                We couldn’t load the issue options right now.
                <br />
                <button className="retry-button" type="button" onClick={loadIssues}>Try loading them again</button>
              </div>
            )}
            {!issuesLoading && !issuesError && issues.length === 0 && (
              <div className="inline-error" role="status">No issue options are available right now. Please try again shortly.</div>
            )}
            {!issuesLoading && !issuesError && issues.length > 0 && (
              <div className="issue-list" role="group" aria-label="Prescription pickup issues">
                {issues.map((issue) => (
                  <button
                    className="issue-option"
                    key={issue.id}
                    type="button"
                    aria-pressed={selectedIssue === issue.id}
                    onClick={() => {
                      setSelectedIssue(issue.id);
                      setAnswer(null);
                      setExplainError(false);
                      setCopyMessage('');
                    }}
                  >
                    <span className="radio-dot" aria-hidden="true" />
                    <span className="issue-text">
                      <span className="issue-title">{issue.title}</span>
                      <span className="issue-description">{issue.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button className="primary-action" type="button" onClick={explainSelectedIssue} disabled={!selectedIssue || explainLoading || issuesLoading}>
              {explainLoading ? 'Preparing your explanation…' : 'Explain this'}
              {!explainLoading && <span className="arrow" aria-hidden="true">→</span>}
            </button>
            {explainError && (
              <div className="inline-error" role="alert">
                We couldn’t prepare this guide. Your selection is still here—please try again.
                <br />
                <button className="retry-button" type="button" onClick={explainSelectedIssue}>Retry explanation</button>
              </div>
            )}
            <p className="select-footnote">General information only. Your selection is not saved.</p>
          </section>

          <section className="panel answer-panel" aria-label="Your explanation" aria-busy={explainLoading}>
            <div className="answer-header">
              <div className="answer-header-row">
                <div>
                  <p className="answer-kicker">Step 2 · Your guide</p>
                  <h2 aria-live="polite">{answerReady ? answer.title : 'A useful next step, made clearer'}</h2>
                </div>
                <button
                  className={`text-action large-toggle${largeText ? ' primary-lite' : ''}`}
                  type="button"
                  aria-pressed={largeText}
                  onClick={() => setLargeText((value) => !value)}
                  aria-label={largeText ? 'Turn off larger text' : 'Make answer text larger'}
                >
                  Aa <span>{largeText ? 'Standard text' : 'Larger text'}</span>
                </button>
              </div>
              {answerReady && (
                <div className={`mode-badge${answer.mode === 'fallback' ? ' fallback' : ''}`} aria-label={answer.mode === 'fallback' ? 'Using a prepared general guide' : 'AI explanation'}>
                  <span className="mode-dot" aria-hidden="true" />
                  {answer.mode === 'fallback' ? 'Prepared guide' : 'AI explanation'}
                </div>
              )}
              {answerReady && answer.mode === 'fallback' && answer.fallbackNotice && (
                <p className="fallback-notice">{answer.fallbackNotice} This guide is still here to help you decide who to contact.</p>
              )}
            </div>

            {explainLoading && (
              <div className="loading-state" role="status" aria-label="Preparing your explanation">
                <div className="skeleton-line heading" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
                <div className="skeleton-card" />
                <div className="skeleton-line medium" />
                <p className="loading-label">Putting together a clear guide…</p>
              </div>
            )}

            {!explainLoading && !answerReady && (
              <div className="answer-placeholder">
                <div className="placeholder-art" aria-hidden="true">Rx</div>
                <h2>Your guide will appear here</h2>
                <p>Choose one of the listed issues, then select “Explain this” to see clear information and practical next steps.</p>
              </div>
            )}

            {!explainLoading && answerReady && (
              <div className="answer-content">
                <section className="answer-block">
                  <h3>What this may mean</h3>
                  <p className="explanation">{answer.explanation}</p>
                </section>
                <section className="answer-block">
                  <h3>Who to contact and why</h3>
                  <div className="contact-card">
                    <span className="contact-team">{TEAM_NAMES[answer.contact?.team] || answer.contact?.team}</span>
                    <p className="contact-reason">{answer.contact?.reason}</p>
                  </div>
                </section>
                <section className="answer-block">
                  <h3>Three next steps</h3>
                  <ol className="steps-list">
                    {(answer.nextSteps || []).slice(0, 3).map((step, index) => (
                      <li key={`${index}-${step}`}><span className="step-number">{index + 1}</span><span>{step}</span></li>
                    ))}
                  </ol>
                </section>
                {(answer.questions || []).length > 0 && (
                  <section className="answer-block">
                    <h3>Questions you could ask</h3>
                    <ul className="questions-list">
                      {answer.questions.slice(0, 3).map((question, index) => <li key={`${index}-${question}`}>{question}</li>)}
                    </ul>
                  </section>
                )}
                <div className="answer-actions" aria-label="Summary actions">
                  <button className="text-action primary-lite" type="button" onClick={copySummary}>Copy summary</button>
                  <button className="text-action" type="button" onClick={() => window.print()}>Print summary</button>
                  <button className="text-action" type="button" onClick={tryAnotherIssue}>Try another issue</button>
                </div>
                <p className="result-message" role="status" aria-live="polite">{copyMessage}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="general-disclaimer" aria-label="General information disclaimer">
          <span className="disclaimer-mark" aria-hidden="true">i</span>
          <span><strong>AI can be wrong. Plans differ. This is general information, not medical or insurance advice.</strong> Confirm details with your pharmacy, prescriber, or insurer. If you may run out, ask your pharmacist what options exist; rules vary by plan and state. Never enter personal, prescription, or insurance details here.</span>
        </aside>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>Rxplain helps make common prescription pickup issues easier to understand.</span>
          <span className="health-status" role="status" aria-live="polite">
            <span className={`health-indicator ${healthError ? 'error' : aiState === 'live' ? 'live' : aiState === 'fallback' ? 'fallback' : ''}`} aria-hidden="true" />
            {healthError ? 'Service status unavailable' : !health ? 'Checking service status…' : health.ai === 'fallback' ? 'Prepared guide mode available' : 'AI explanations available'}
          </span>
        </div>
      </footer>
    </div>
  );
}
