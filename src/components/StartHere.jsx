// A short guide to the features available in the Rxplain MVP.
export default function StartHere({ health }) {
  const steps = [
    { done: true, text: 'Choose from five common prescription access issues' },
    {
      done: health?.ai === 'live',
      text: health?.ai === 'live'
        ? 'Gemini explanations are available; safe guides remain ready as a fallback'
        : 'Safe prewritten guides are available; configure GEMINI_API_KEY for AI explanations',
    },
    { done: true, text: 'Review who to contact first, three next steps, and questions to ask' },
    { done: true, text: 'Copy or print a guide, or choose larger text' },
    { done: true, text: 'No account or personal, prescription, or insurance details are needed' },
  ];
  const finished = steps.filter((s) => s.done).length;

  return (
    <section className="card start-here" aria-labelledby="start-title">
      <div className="card-head">
        <h2 id="start-title">Start here</h2>
        <span className="count">{finished} / {steps.length}</span>
      </div>
      <ol className="checklist">
        {steps.map((step) => (
          <li key={step.text} className={step.done ? 'done' : ''}>
            <span className="box" aria-hidden="true">{step.done ? '✓' : ''}</span>
            <span>{step.text}</span>
            <span className="sr-only">{step.done ? '(done)' : '(to do)'}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
