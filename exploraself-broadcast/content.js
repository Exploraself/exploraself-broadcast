// ExploraSelf Broadcast — the editorial layer.
//
// WHY THIS MATTERS TO YOU
// Every reader picks an industry. Every story carries a topic. We then say, in
// one or two sentences, where that kind of news usually lands in their trade.
//
// 28 topics x 30 industries = 840 combinations. Rather than 840 separate lines
// that would drift in quality and make every new industry cost 28 more, each
// topic belongs to one of five families (self, people, tech, market, money) and
// each industry says where each family lands for them. 28 lenses + 150 landing
// lines cover all 840 pairs, and a new industry costs five lines, not twenty-eight.
// `overrides` holds hand-written lines for the pairs worth sharpening; they win.
//
// These are ExploraSelf's lens on a KIND of news, never a claim about a
// particular story or publisher, and never a prediction.

export const families = ['self', 'people', 'tech', 'market', 'money'];

export const topics = {
  // --- self: judgement, character, the person behind the business ---
  'Decision-making': { family: 'self', lens: 'Every business problem eventually becomes a decision somebody has to own.' },
  'Leadership': { family: 'self', lens: 'A business rarely outgrows the judgement of the person leading it.' },
  'Burnout & wellbeing': { family: 'self', lens: 'Tired people make expensive decisions, and the cost shows up later.' },
  'Reputation & trust': { family: 'self', lens: 'Trust takes years to build and one careless week to spend.' },
  // --- people: teams, hiring, the way work is done ---
  'Team & culture': { family: 'people', lens: 'What people expect from work keeps shifting, and it reaches employers before it reaches the law.' },
  'Hiring & talent': { family: 'people', lens: 'What skilled people will accept decides who you can hire and what you pay.' },
  'Jobs & careers': { family: 'people', lens: 'When people feel secure or exposed at work, their spending and their loyalty both change.' },
  'Remote & hybrid work': { family: 'people', lens: 'Where work happens changes who applies, how you manage and what you pay for.' },
  'Skills & training': { family: 'people', lens: 'The skills that were enough last year quietly stop being enough.' },
  // --- tech: tools, automation, security ---
  'AI & technology': { family: 'tech', lens: 'The cheap, repeatable part of most work is being automated. Judgement and care are not.' },
  'Automation & productivity': { family: 'tech', lens: 'Work that can be described as a process will eventually be done by one.' },
  'Software & tools': { family: 'tech', lens: 'The tools a trade runs on change slowly, then all at once.' },
  'Cybersecurity': { family: 'tech', lens: 'Most breaches start with an ordinary person having an ordinary bad day.' },
  // --- market: customers, demand, competition ---
  'Growth & customers': { family: 'market', lens: 'Customers change their minds before the numbers change. It is the earliest signal you get.' },
  'Marketing & advertising': { family: 'market', lens: 'How people find and judge a business is being rewritten faster than most budgets.' },
  'Sales & pricing': { family: 'market', lens: 'Price is the fastest lever in any business and the easiest one to pull badly.' },
  'Consumer confidence': { family: 'market', lens: 'Confidence moves months before spending does, and it moves both ways.' },
  'Competition': { family: 'market', lens: 'Competitors rarely take your customers. They give them a reason to leave.' },
  'Innovation & R&D': { family: 'market', lens: 'What is new today sets what customers expect as standard tomorrow.' },
  // --- money: costs, rates, rules, capital ---
  'Economy': { family: 'money', lens: 'Rates, costs and confidence set the weather every business trades in.' },
  'Interest rates': { family: 'money', lens: 'Rates change what borrowing costs and how long buyers wait before committing.' },
  'Tax & regulation': { family: 'money', lens: 'Rules change slowly, then arrive with a deadline attached.' },
  'Energy & costs': { family: 'money', lens: 'Input costs reach your margin long before they reach your price list.' },
  'Supply chain & trade': { family: 'money', lens: 'Delays and tariffs land as cash tied up in the wrong place at the wrong time.' },
  'Funding & investment': { family: 'money', lens: 'When money gets cautious, it gets slower and pickier before it gets scarce.' },
  'Property & premises': { family: 'money', lens: 'Rent and space are usually a fixed cost until suddenly they are a strategic one.' },
  'Legal & compliance': { family: 'money', lens: 'Obligations are cheap to meet early and expensive to meet late.' },
  'Sustainability': { family: 'money', lens: 'What is voluntary for large companies becomes a condition of supplying them.' },
};

// Where each family of news lands, per industry. Completes the sentence:
// "For <industry>, that usually lands on …"
export const industries = {
  'Coaching & consulting': {
    self: 'the judgement your clients are actually paying for',
    people: 'what your associates and clients now expect from how you work',
    tech: 'the rough answer clients can get free before they ever call you',
    market: 'where your next enquiry comes from, and what it is worth',
    money: 'training budgets, which get cut early and restored late',
  },
  'Trades & construction': {
    self: 'the quote and the scheduling call, where most jobs go wrong',
    people: 'your next hire, because skilled hands are the hardest thing to replace',
    tech: 'quoting, scheduling and site records, where the admin cost sits',
    market: 'your pipeline about three months out',
    money: 'whether projects get signed off, and how fast you get paid',
  },
  'Health & wellness': {
    self: 'the calm you bring into the room, which clients read immediately',
    people: 'burnout in your team, which reaches clients within a week',
    tech: 'clients arriving having already asked an AI',
    market: 'bookings, because health spending is discretionary',
    money: 'memberships and session volume, which move with household budgets',
  },
  'Hospitality & food': {
    self: 'the manager on the floor, because service follows their mood',
    people: 'your rota, your biggest cost and your biggest risk',
    tech: 'bookings, rotas and ordering, which automate before the welcome does',
    market: 'covers, because eating out is cut first and returns first',
    money: 'food, energy and wages, which rarely move one at a time',
  },
  'Retail & e-commerce': {
    self: 'stock, discounts and ad spend, judgement calls made fast',
    people: 'seasonal staff, who decide your busiest weeks',
    tech: 'search, ads and product pages, where last year’s method quietly stops working',
    market: 'your sales forecast, read a few weeks early',
    money: 'cost of goods, which moves before your price list does',
  },
  'Creative & media': {
    self: 'which project you say yes to, which quietly decides your year',
    people: 'freelancers, who choose who they work with and talk to each other',
    tech: 'the cheap end of your work, which automates before the thinking does',
    market: 'the briefs coming, because marketing budgets move first',
    money: 'advertising spend, which tracks the economy closely',
  },
  'Software & tech': {
    self: 'build, buy or wait, your costliest call',
    people: 'what your next candidate asks for before salary',
    tech: 'your roadmap and your pricing, usually within months',
    market: 'the length of your sales cycle',
    money: 'what you can raise and what buyers can approve',
  },
  'Property & real estate': {
    self: 'trust in you, which is what the deal actually turns on',
    people: 'keeping your best agents, who go where the split is better',
    tech: 'listings, valuations and viewings, though not the relationships',
    market: 'buyer confidence, which is effectively the whole market',
    money: 'rates, which move your numbers faster than anything else',
  },
  'Professional services': {
    self: 'your judgement, which is the thing clients buy, not your hours',
    people: 'your people, who are the whole firm',
    tech: 'drafting and research, which make the billable hour harder to defend',
    market: 'clients buying advice when they are growing or frightened',
    money: 'fee pressure, which follows client pressure with a lag',
  },
  'Education & training': {
    self: 'what you choose to teach, and how',
    people: 'teaching staff, where workload reaches retention before results',
    tech: 'learners who already have an AI tutor at home',
    market: 'enrolment, which follows confidence and job security',
    money: 'public and company training budgets',
  },
  'Manufacturing': {
    self: 'capital decisions that lock you in for years',
    people: 'shift work and safety culture, which decide output',
    tech: 'the line and the planning, which change the skills you hire for',
    market: 'your order book, which follows your customers’ demand with a lag',
    money: 'energy, materials and trade rules, where margin is decided',
  },
  'Transport & logistics': {
    self: 'routing and pricing calls made daily under time pressure',
    people: 'drivers, who work alone and decide whether loads move at all',
    tech: 'routing, tracking and paperwork, where margin moves to early adopters',
    market: 'freight volume, which follows retail and manufacturing demand',
    money: 'fuel, rates and trade rules, which are your profit line',
  },
  'Agriculture & food production': {
    self: 'decisions made a season ahead with incomplete information',
    people: 'seasonal labour, which arrives or it does not',
    tech: 'monitoring and machinery, which change yield and headcount together',
    market: 'what buyers and supermarkets will commit to',
    money: 'input costs and subsidies, which set your whole year',
  },
  'Beauty & personal care': {
    self: 'the atmosphere you create, which clients return for',
    people: 'stylists and therapists, who take their clients with them',
    tech: 'booking, reminders and the way clients discover you',
    market: 'frequency of visits, which stretches when money is tight',
    money: 'product costs and rent, which rarely move in your favour together',
  },
  'Fitness & sport': {
    self: 'the standard you hold yourself to, which members notice',
    people: 'coaches and instructors, who are the reason members stay',
    tech: 'apps and wearables, which members compare you against',
    market: 'sign-ups and cancellations, which swing with confidence',
    money: 'memberships, which are among the first subscriptions cancelled',
  },
  'Marketing & advertising agencies': {
    self: 'which clients you take on, and which you should not',
    people: 'your team, whose best work needs a clear brief and a steady hand',
    tech: 'the channels and tools your whole offer is built on',
    market: 'client budgets, which move before anyone announces it',
    money: 'retainers, which are reviewed first when a client gets nervous',
  },
  'Finance & insurance': {
    self: 'the judgement behind advice you cannot take back',
    people: 'advisers and underwriters, where experience is the scarce resource',
    tech: 'process, risk models and the expectations of younger clients',
    market: 'what clients worry about, which is what they buy',
    money: 'rates and rules, which are the business itself',
  },
  'Legal services': {
    self: 'the call you make when the law allows more than one answer',
    people: 'juniors and partners, who watch behaviour more than policy',
    tech: 'drafting, research and disclosure, which compress billable time',
    market: 'clients instructing when they are expanding or exposed',
    money: 'regulation, which creates and removes whole areas of work',
  },
  'Accounting & bookkeeping': {
    self: 'the advice you give beyond the numbers',
    people: 'qualified staff, in a market that competes hard for them',
    tech: 'reconciliation and reporting, which automate before advice does',
    market: 'clients needing you most when something has gone wrong',
    money: 'tax rules and deadlines, which are your calendar',
  },
  'Recruitment & HR': {
    self: 'the candidate you put forward when you are under target',
    people: 'your entire product, which is other people’s working lives',
    tech: 'sourcing and screening, where speed is becoming table stakes',
    market: 'hiring appetite, which turns off faster than it turns on',
    money: 'headcount budgets, which freeze before anyone says so publicly',
  },
  'IT services & support': {
    self: 'what you tell a client they do not need to buy',
    people: 'engineers, who leave managers rather than companies',
    tech: 'your whole service line, and what clients now expect included',
    market: 'clients delaying projects rather than cancelling them',
    money: 'licence and hardware costs, which you often absorb first',
  },
  'Events & entertainment': {
    self: 'the call to commit before the bookings are confirmed',
    people: 'crew and suppliers you rely on at short notice',
    tech: 'ticketing, discovery and how audiences decide to come',
    market: 'ticket sales, which arrive later each year',
    money: 'venue, insurance and travel costs, committed long before revenue',
  },
  'Travel & tourism': {
    self: 'decisions made far ahead of the season you are selling',
    people: 'seasonal staff and guides, who set the guest experience',
    tech: 'how guests discover, compare and book you',
    market: 'booking windows, which shorten when people feel uncertain',
    money: 'fuel, currency and rules, which move your costs overnight',
  },
  'Automotive': {
    self: 'stock and pricing calls made against a slow-moving forecourt',
    people: 'technicians, where the skills shortage is structural',
    tech: 'electric, software and diagnostics, which change the whole workshop',
    market: 'buyer confidence, because almost nobody has to buy now',
    money: 'finance rates, which decide affordability more than price does',
  },
  'Energy & utilities': {
    self: 'decisions with consequences measured in decades',
    people: 'a workforce retiring faster than it is being replaced',
    tech: 'grid, metering and monitoring, where investment is concentrated',
    market: 'customers who now compare and switch far more readily',
    money: 'regulation and wholesale prices, which are the business',
  },
  'Non-profit & charity': {
    self: 'decisions weighed against mission, not only cost',
    people: 'staff and volunteers who stay for purpose and leave from exhaustion',
    tech: 'donor reach and reporting, where small gains compound',
    market: 'public attention, which decides which causes get funded',
    money: 'grants and donations, which fall first in hard times',
  },
  'Childcare & family services': {
    self: 'the standard you will not drop under pressure',
    people: 'staff ratios and qualifications, which are the service',
    tech: 'admin and parent communication, where time can be won back',
    market: 'what parents can afford and what they prioritise',
    money: 'funding rules and wage floors, which set your viability',
  },
  'Cleaning & facilities': {
    self: 'the standard you accept when nobody is checking',
    people: 'staff turnover, which is the industry’s defining cost',
    tech: 'scheduling and proof of work, where contracts are won',
    market: 'clients reviewing contracts whenever they review budgets',
    money: 'wages and materials, against contracts priced long ago',
  },
  'Security services': {
    self: 'the judgement of the person on shift at three in the morning',
    people: 'licensed staff, where availability is the whole constraint',
    tech: 'monitoring and reporting, which clients now expect as standard',
    market: 'clients buying after an incident, not before',
    money: 'wage floors and contract terms set well in advance',
  },
  'Wholesale & distribution': {
    self: 'buying decisions made before demand is confirmed',
    people: 'warehouse and driver teams, where reliability is everything',
    tech: 'stock visibility and ordering, where the margin now hides',
    market: 'your customers’ customers, two steps ahead of your order book',
    money: 'cash tied up in stock, which is your real risk',
  },
};

// Hand-written lines for pairs worth sharpening. overrides[topic][industry] wins.
export const overrides = {
  'Decision-making': {
    'Coaching & consulting': 'Your clients buy your judgement. Whatever sharpens how you decide is also something you can teach.',
    'Trades & construction': 'Most jobs go wrong at the quote and the scheduling call, not on site. This is about those calls.',
    'Professional services': 'Clients pay for your judgement, not your hours. This is the raw material of what you sell.',
    'Manufacturing': 'Capital decisions lock you in for years. How you weigh them is worth more than any single machine.',
  },
  'Leadership': {
    'Trades & construction': 'Your crew copies you, not your rules. How other leaders act shows what yours are absorbing.',
    'Hospitality & food': 'Service quality follows the manager on the floor. This is about that effect, for better or worse.',
    'Software & tech': 'People leave managers, not companies. Watch what other leaders are getting right and wrong.',
    'Manufacturing': 'Safety and quality follow the standard the leader actually accepts, not the one on the wall.',
    'Transport & logistics': 'Drivers and depot staff work alone most of the day. How you lead at a distance decides everything.',
  },
  'Team & culture': {
    'Health & wellness': 'Burnout in your team reaches your clients within a week. Watch what is happening to workloads.',
    'Hospitality & food': 'Staffing is your biggest cost and your biggest risk. News about work lands on your rota first.',
    'Creative & media': 'Freelancers choose who they work with. How you treat them travels fast in a small industry.',
    'Transport & logistics': 'Driver shortages and conditions decide whether loads move at all. Worth watching closely.',
  },
  'AI & technology': {
    'Coaching & consulting': 'Clients can get a rough answer free now. Your value moves to judgement, challenge and accountability.',
    'Health & wellness': 'Clients arrive having already asked an AI. Your job is to correct it, personalise it and hold them to it.',
    'Creative & media': 'The cheap end of your work is being automated. The thinking and the taste are not.',
    'Professional services': 'Drafting and research keep getting faster. Billing by the hour gets harder to defend.',
    'Education & training': 'Learners already have an AI tutor. Your value moves to structure, feedback and keeping them going.',
  },
  'Growth & customers': {
    'Hospitality & food': 'Eating out is the first thing cut and the first thing returned. Watch customer mood closely.',
    'Retail & e-commerce': 'This is your weather. News about customer behaviour is effectively your sales forecast.',
    'Property & real estate': 'Buyer confidence is the whole market. Treat this as your leading indicator.',
    'Professional services': 'Clients buy advice when they are growing or frightened. Both show up here first.',
  },
  'Economy': {
    'Coaching & consulting': 'Training budgets get cut early and restored late. Price and position for that reality.',
    'Trades & construction': 'Interest rates decide whether projects start. Material costs decide whether they pay.',
    'Hospitality & food': 'Food costs, energy and wages move together. Check all three before you reprint a menu.',
    'Property & real estate': 'Rates are the market. Little else moves your numbers as fast.',
    'Transport & logistics': 'Fuel, rates and trade rules are your profit line. This is the page that matters most to you.',
  },
};

const article = (name) => (/^[AEIOU]/.test(name) ? 'an ' : 'a ');

/** The "why this matters to you" line for one topic and one industry. */
export function whyLine(topic, industry) {
  const t = topics[topic];
  if (!t) return '';
  const hand = overrides[topic] && overrides[topic][industry];
  if (hand) return hand;
  const landing = industries[industry] && industries[industry][t.family];
  if (!landing) return t.lens;
  return `${t.lens} For ${industry.toLowerCase()}, that usually lands on ${landing}.`;
}

/** How many combinations are covered, for the preferences screen. */
export function coverage() {
  return Object.keys(topics).length * Object.keys(industries).length;
}

export const industryNames = Object.keys(industries);
export const topicNames = Object.keys(topics);

// Your own articles on exploraself.com, matched to news topics.
export const articles = [
  { slug: 'pace-how-to-decide-when-everything-is-urgent', domain: 'Work',
    title: 'P.A.C.E.: how to decide when everything feels urgent',
    dek: 'Four steps to clear decisions under pressure.', minutes: 4,
    topics: ['Decision-making', 'Economy', 'Burnout & wellbeing'] },
  { slug: 'who-is-running-your-business-decisions', domain: 'Work',
    title: 'Mastering your inner boardroom: who really makes your business decisions',
    dek: 'Hear your Dreamer, Realist and Critic, then make the call with confidence.', minutes: 9,
    topics: ['Decision-making', 'Funding & investment'] },
  { slug: 'lead-from-the-tower', domain: 'Self',
    title: 'Lead from the tower: why focus is the first skill of leadership',
    dek: 'Get your focus back, protect your energy, and lead from calm.', minutes: 8,
    topics: ['Leadership', 'Burnout & wellbeing', 'Automation & productivity'] },
  { slug: 'knowledge-makes-you-informed-wisdom-makes-you-brave', domain: 'Self',
    title: 'Knowledge makes you informed. Wisdom makes you brave.',
    dek: 'Turn what you already know into brave moves this week.', minutes: 4,
    topics: ['Leadership', 'Decision-making', 'Skills & training'] },
  { slug: 'tools-can-think-only-you-can-care', domain: 'People',
    title: 'Tools can think. Only you can care: how to stay valuable in the age of AI',
    dek: 'Grow the human skills no machine can replace.', minutes: 5,
    topics: ['AI & technology', 'Team & culture', 'Skills & training', 'Automation & productivity'] },
  { slug: 'the-four-floors-of-leadership', domain: 'Business',
    title: "The four floors of leadership: build a business that can't be shaken",
    dek: 'Find the floor that holds you back, and fix it from the ground up.', minutes: 4,
    topics: ['Growth & customers', 'Leadership', 'Competition'] },
];

export function articlesFor(topicList = []) {
  return articles.filter((a) => a.topics.some((t) => topicList.includes(t)));
}

// One sharp, honest hook per topic into the right ExploraSelf tool.
const unshakeable = { name: 'Unshakeable', price: '$9.99', label: 'Take the audit', url: 'https://exploraself.com/unshakeable' };
const boardroom = { name: 'The Inner Boardroom', price: 'Free', label: 'Find out which', url: 'https://exploraself.com/unbound' };
const eq = { name: 'The EQ Dividend', price: 'Free', label: 'Check your EQ', url: 'https://exploraself.com/eq' };
const rise = { name: 'Allow Yourself to Rise', price: 'Free', label: 'Find your lid', url: 'https://exploraself.com/rise' };
const first100 = { name: 'First 100 Perfect Clients', price: 'Free', label: 'Test your marketing', url: 'https://exploraself.com/first-100-clients' };

export const teasers = {
  self: { ...unshakeable, hook: 'Your ambition hides your blind spots. Four domains, one honest audit, a plan you can act on.' },
  people: { ...eq, hook: 'Everyone says emotional intelligence pays. This shows you whether yours actually is.' },
  tech: { ...rise, hook: 'There is a lid on your potential, and it is rarely the technology.' },
  market: { ...first100, hook: 'Booked solid and still capped? The gap is usually between your offer and the client you want.' },
  money: { ...boardroom, hook: 'Three voices argue inside every decision about money. One of them is running the room.' },
};

export function teaserFor(topic) {
  const t = topics[topic];
  return teasers[t ? t.family : 'self'];
}
