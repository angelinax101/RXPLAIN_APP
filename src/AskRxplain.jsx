import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const STATUS_NAMES = {
  matched: 'Closest issue found',
  uncertain: 'Not sure yet',
  out_of_scope: 'Outside this guide',
};

export default function AskRxplain() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const sessionRef = useRef(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') closePanel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function openPanel() {
    setMessages([]);
    setDraft('');
    setError(false);
    setLoading(false);
    submittingRef.current = false;
    sessionRef.current += 1;
    setOpen(true);
  }

  function closePanel() {
    sessionRef.current += 1;
    submittingRef.current = false;
    setOpen(false);
    setMessages([]);
    setDraft('');
    setLoading(false);
    setError(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  async function submit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || message.length > 500 || loading || submittingRef.current) return;
    const activeSession = sessionRef.current;
    submittingRef.current = true;
    setLoading(true);
    setError(false);
    setMessages((current) => [...current, { id: `${Date.now()}-user`, kind: 'user', message }]);
    setDraft('');
    try {
      const reply = await api.ask(message);
      if (activeSession !== sessionRef.current) return;
      setMessages((current) => [...current, { id: `${Date.now()}-reply`, kind: 'reply', reply }]);
    } catch {
      if (activeSession === sessionRef.current) {
        setDraft(message);
        setError(true);
      }
    } finally {
      if (activeSession === sessionRef.current) {
        submittingRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <div className="ask-rxplain">
      {open && (
        <section className="ask-panel" role="dialog" aria-modal="false" aria-labelledby="ask-title">
          <header className="ask-header">
            <div className="ask-avatar" aria-hidden="true">Rx</div>
            <div className="ask-heading">
              <p className="ask-eyebrow">A little help finding your way</p>
              <h2 id="ask-title">Ask Rxplain</h2>
            </div>
            <button className="ask-close" type="button" onClick={closePanel} aria-label="Close Ask Rxplain">×</button>
          </header>

          <p className="ask-scope">Share up to 500 characters (about four or five short sentences) about prescription pickup or coverage. This guide can’t answer medical questions.</p>
          <div className="ask-transcript" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 && (
              <div className="ask-welcome">
                <span className="ask-welcome-mark" aria-hidden="true">01</span>
                <p>Tell us briefly what happened at pickup or with coverage.</p>
                <span>Keep personal and prescription details out.</span>
              </div>
            )}
            {messages.map((item) => item.kind === 'user' ? (
              <div className="ask-user-message" key={item.id}>{item.message}</div>
            ) : (
              <article className={`ask-reply ask-reply-${item.reply.status}`} key={item.id}>
                <div className="ask-reply-topline">
                  <span className="ask-status">{STATUS_NAMES[item.reply.status] || 'Rxplain response'}</span>
                  {item.reply.mode === 'fallback' && <span className="ask-mode">Prepared response</span>}
                </div>
                <p className="ask-reply-copy">{item.reply.message}</p>
              </article>
            ))}
            {loading && (
              <div className="ask-loading" role="status" aria-label="Finding a guide">
                <span /><span /><span />
                <span className="sr-only">Finding a guide…</span>
              </div>
            )}
          </div>

          {error && (
            <p className="ask-error" role="alert">We couldn’t send that just now. Please try again.</p>
          )}

          <form className="ask-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="ask-message">Describe your prescription access issue</label>
            <textarea
              ref={inputRef}
              id="ask-message"
              value={draft}
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What happened at pickup?"
              rows={2}
              aria-describedby="ask-count"
              disabled={loading}
            />
            <div className="ask-form-bottom">
              <span id="ask-count" className={draft.length >= 480 ? 'ask-count near-limit' : 'ask-count'} aria-live="polite">{draft.length}/500</span>
              <button className="ask-send" type="submit" disabled={!draft.trim() || draft.length > 500 || loading}>
                {loading ? 'Sending…' : 'Send'}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>

          <p className="ask-privacy">Your message is sent to Gemini for issue classification and isn’t saved by Rxplain. Some obvious contact and ID details are removed before sending, but this may miss information. Don’t include names, medication names, birth dates, or prescription or insurance details.</p>
        </section>
      )}
      <button
        ref={launcherRef}
        className={`ask-launcher${open ? ' is-open' : ''}`}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={open ? closePanel : openPanel}
      >
        <span className="ask-launcher-icon" aria-hidden="true">{open ? '×' : 'Rx'}</span>
        <span>{open ? 'Close helper' : 'Ask Rxplain'}</span>
      </button>
    </div>
  );
}
