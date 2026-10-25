// ExploraSelf Broadcast — one line-drawn icon set.
// Serious, not playful: 1.5 stroke, no fills, no emoji, currentColor only.

const svg = (body, cls) =>
  `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const paths = {
  // the four domains
  self: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 3.9-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  people: '<circle cx="8.5" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M3 19c.9-3 3-4.6 5.5-4.6S13.1 16 14 19"/><path d="M14.5 14.6c2.6-.4 4.9.9 6 4.4"/>',
  work: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M14 17h6M17 14v6"/>',
  business: '<path d="M3 20h18"/><path d="M5 16l5-5 3.5 3.5L20 8"/><path d="M15 8h5v5"/>',
  // the five topic families
  money: '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.3c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.3.7-2.3 1.8 0 2.4 5 1.2 5 3.9 0 1.2-1 2.1-2.6 2.1-1.1 0-2.1-.4-2.7-1.3M12 6.6v10.8"/>',
  market: '<path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 12 19 5"/><path d="M15 4h4.5v4.5"/>',
  tech: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
  // utility
  compass: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z"/><path d="m12 7.5 1.4 3.1 3.1 1.4-3.1 1.4L12 16.5l-1.4-3.1L7.5 12l3.1-1.4L12 7.5Z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
  arrow: '<path d="M4 12h15"/><path d="m13.5 6.5 5.5 5.5-5.5 5.5"/>',
  book: '<path d="M4 4.5h6a3 3 0 0 1 3 3v12a2.4 2.4 0 0 0-2.4-2.4H4Z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3v12a2.4 2.4 0 0 1 2.4-2.4H20Z"/>',
  play: '<circle cx="12" cy="12" r="8.5"/><path d="M10 8.8 16 12l-6 3.2Z"/>',
  layers: '<path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z"/><path d="m4 12 8 4.3 8-4.3M4 16.4l8 4.3 8-4.3"/>',
};

export const icon = (name, cls) => (paths[name] ? svg(paths[name], cls) : '');

export const domainIcon = (d) => icon({ Self: 'self', People: 'people', Work: 'work', Business: 'business' }[d] || 'compass');

// The five assessments, with the icon and the hook that sells each one.
export const assessments = [
  { name: 'Unshakeable', domain: 'Self', icon: 'compass', price: '$9.99', worth: 'Valued at $199',
    line: 'Your whole leadership, audited across four domains.',
    hook: 'Your ambition hides your blind spots.',
    url: 'https://exploraself.com/unshakeable', label: 'Take the audit' },
  { name: 'Allow Yourself to Rise', domain: 'Self', icon: 'target', price: 'Free', worth: '',
    line: 'How high can you fly, and what is capping it?',
    hook: 'There is a lid on your potential.',
    url: 'https://exploraself.com/rise', label: 'Find your lid' },
  { name: 'The EQ Dividend', domain: 'People', icon: 'people', price: 'Free', worth: '',
    line: 'Whether your emotional intelligence is paying you back.',
    hook: 'Everyone says EQ pays. Does yours?',
    url: 'https://exploraself.com/eq', label: 'Check your EQ' },
  { name: 'The Inner Boardroom', domain: 'Work', icon: 'layers', price: 'Free', worth: '',
    line: 'Which voice is really making your decisions.',
    hook: 'Three voices argue in every decision. One runs the room.',
    url: 'https://exploraself.com/unbound', label: 'Find out which' },
  { name: 'First 100 Perfect Clients', domain: 'Business', icon: 'business', price: 'Free', worth: '',
    line: 'The gap between your offer and the clients you want.',
    hook: 'Booked solid and still capped?',
    url: 'https://exploraself.com/first-100-clients', label: 'Test your marketing' },
];
