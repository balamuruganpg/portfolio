/** Original conversation + connected-evidence mark, drawn for this portfolio. */
export default function AssistantMark({ className = "" }: { className?: string }) {
  return <svg data-assistant-emblem aria-hidden="true" focusable="false" viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M22 6.5H10a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h2v4l5-4h5a5 5 0 0 0 5-5v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m11 17 5-4 5 6M11 17l10 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".65" />
    <circle cx="11" cy="17" r="2" fill="currentColor" />
    <circle cx="16" cy="13" r="2" fill="currentColor" />
    <circle cx="21" cy="19" r="2" fill="currentColor" />
    <path d="m26 3 .9 2.6 2.6.9-2.6.9L26 10l-.9-2.6-2.6-.9 2.6-.9L26 3Z" fill="currentColor" />
  </svg>;
}
