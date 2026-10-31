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
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M7.5 14h3M13.5 14h3M7.5 17.3h3"/>',
  lab: '<path d="M10 3v6.2L4.8 18A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M8.5 3h7M7.6 14.5h8.8"/>',
  hub: '<circle cx="12" cy="12" r="2.8"/><circle cx="5" cy="5.6" r="2.1"/><circle cx="19" cy="5.6" r="2.1"/><circle cx="5" cy="18.4" r="2.1"/><circle cx="19" cy="18.4" r="2.1"/><path d="m6.6 7.1 3.5 3.1M17.4 7.1l-3.5 3.1M6.6 16.9l3.5-3.1M17.4 16.9l-3.5-3.1"/>',
};

export const icon = (name, cls) => (paths[name] ? svg(paths[name], cls) : '');

export const domainIcon = (d) => icon({ Self: 'self', People: 'people', Work: 'work', Business: 'business' }[d] || 'compass');

// The four ways to lead, always named in full on screen (01 START HERE §13).
// The keys stay Self/People/Work/Business: they are data, saved preferences
// and the feed's domain map. Only what the reader sees changes.
export const domainName = { Self: 'Lead yourself', People: 'Lead your people', Work: 'Lead your business', Business: 'Lead the market' };
export const nameOf = (d) => domainName[d] || d;

// The two roads. The Leader's North Star answers "where am I?"; The Founder's
// Blueprint answers "how do I get there?". Same pages as exploraself.com's
// two-roads band, so every door says the same thing.
export const roads = [
  { name: 'The Leader’s North Star', icon: 'compass', price: 'Free', tone: 'north', showName: true,
    title: 'Where do you stand as a leader?',
    line: 'A free reading across the four ways to lead, and where to start.',
    sub: 'Four parts · your reading, your card and an action plan',
    url: 'https://linktolead.exploraself.com/north1/', label: 'Show me my road' },
  { name: 'The Founder’s Blueprint', icon: 'layers', price: 'Free to start', tone: 'gold', showName: true,
    title: 'Your business can’t grow past you.',
    line: 'Twelve weeks that take the business out of your head and onto paper.',
    url: 'https://linktolead.exploraself.com/road1/', label: 'Start free tonight' },
];

// The five assessments, with the icon and the hook that sells each one.
export const assessments = [
  { name: 'Unshakeable', domain: 'Self', icon: 'compass', price: '$9.99', worth: '',
    title: 'The audit your ego would skip.',
    line: 'Your whole leadership, across four domains.',
    hook: 'Ambition is very good at hiding what it costs you.',
    url: 'https://exploraself.com/unshakeable', label: 'Take the audit' },
  { name: 'Allow Yourself to Rise', domain: 'Self', icon: 'target', price: 'Free', worth: '',
    title: 'Your ceiling has a name.',
    line: 'How high can you fly, and what is capping it?',
    hook: 'Most lids are not the market. They are closer to home.',
    url: 'https://exploraself.com/rise', label: 'Find your lid' },
  { name: 'The EQ Dividend', domain: 'People', icon: 'people', price: 'Free', worth: '',
    title: 'Is your EQ paying rent?',
    line: 'Awareness, empathy and influence, measured.',
    hook: 'Everyone says emotional intelligence pays. Yours either does or it does not.',
    url: 'https://exploraself.com/eq', label: 'Check your EQ' },
  { name: 'The Inner Boardroom', domain: 'Work', icon: 'layers', price: 'Free', worth: '',
    title: 'Who hijacked your last decision?',
    line: 'Dreamer, Realist, Critic. One of them is louder.',
    hook: 'You chair a board you have never met. Time for introductions.',
    url: 'https://exploraself.com/unbound', label: 'Find out which' },
  { name: 'First 100 Perfect Clients', domain: 'Business', icon: 'business', price: 'Free', worth: '',
    title: 'Busy is not the same as chosen.',
    line: 'The gap between your offer and the clients you want.',
    hook: 'Booked solid and still capped is a positioning problem, not an effort one.',
    url: 'https://exploraself.com/first-100-clients', label: 'Test your marketing' },
];

// The rest of the ladder, promoted the same way: a witty line first, the name second.
export const products = [
  { name: 'Leadionaire', icon: 'play', price: 'Free',
    title: "Think you'd survive the Boardroom round?",
    line: '15 questions, 30 seconds each. Reach 1,000 points for a free Unshakeable code.',
    url: 'https://exploraself.com/leadionaire', label: 'Take the hot seat' },
  { name: 'Personal Leadership LAB', icon: 'lab', price: '$97',
    title: 'Work on the operator, not just the machine.',
    line: 'Four lessons on the person behind the business.',
    url: 'https://exploraself.com/lab', label: 'Explore the LAB' },
  { name: 'Business Growth HUB', icon: 'hub', price: '$399',
    title: 'Twelve weeks, and somebody honest in the room.',
    line: 'Full access with mentoring. Includes Link to Lead.',
    url: 'https://exploraself.com/hub', label: 'Explore the HUB' },
  { name: 'Unshakeable: The Personal Leadership Manual', icon: 'book', price: 'Amazon',
    title: 'Guessing is an expensive way to build a business.',
    line: 'The printed manual. Hardcover, paperback and Kindle.',
    url: 'https://shop.exploraself.com/book/unshakeable/', label: 'Discover the book' },
  { name: '2027 Leadership Calendars', icon: 'calendar', price: 'from $19',
    title: 'Twelve months. Twelve ways to lead.',
    line: 'Wall and desk editions, a principle and a practice for every month.',
    url: 'https://shop.exploraself.com/#shop', label: 'See the calendars' },
];
