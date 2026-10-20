export const nav = [
  ['About', '#about'],
  ['Services', '#services'],
  ['Process', '#process'],
  ['Work', '#work'],
  ['FAQ', '#faq'],
]

export const marquee = [
  'React', 'JavaScript', 'Python', 'FastAPI', 'Flask', 'Firebase', 'PostgreSQL',
  'MongoDB', 'Three.js', 'GSAP', 'GitHub Actions', 'Docker', 'HuggingFace', 'PyTorch',
]

export const stats = [
  { n: 35, suffix: '', label: 'company career systems unified in one project' },
  { n: 229, suffix: '', label: 'automated tests behind that project' },
  { n: 50, suffix: '+', label: 'bugs caught before reaching production' },
  { n: 30, suffix: '%', label: 'higher session engagement in an AI web app' },
]

export const services = [
  {
    title: 'Design & UI',
    text: 'Clean, responsive layouts that look sharp on every screen and guide visitors towards taking action.',
  },
  {
    title: 'Frontend development',
    text: 'Fast React websites with smooth animation, accessible markup and search-friendly structure.',
  },
  {
    title: 'Backend & databases',
    text: 'Python APIs (FastAPI, Flask) with PostgreSQL, MongoDB or Firebase for forms, logins, dashboards and data.',
  },
  {
    title: 'AI-powered features',
    text: 'Add smart search, text analysis or LLM-based features to your site using modern NLP and AI APIs.',
  },
  {
    title: 'Testing & quality',
    text: 'Edge cases, failure scenarios and full user flows get tested before anything goes live.',
  },
  {
    title: 'Launch & hosting',
    text: 'Domain, hosting and automated deployment set up for you, so your site goes live and stays live.',
  },
]

export const process = [
  { title: 'Discover', text: 'We talk through your goals, audience and what success looks like. You leave with a clear scope.' },
  { title: 'Design', text: 'I shape the structure, look and feel, and share it with you before any heavy coding starts.' },
  { title: 'Build', text: 'Clean, fast code for the frontend and any backend you need, shared as it progresses.' },
  { title: 'Test', text: 'Real devices, odd inputs and failure cases are checked so problems are found by me, not your visitors.' },
  { title: 'Launch', text: 'Hosting, domain and deployment are handled end to end, and your site goes live.' },
  { title: 'Support', text: 'After launch, fixes and updates stay one message away.' },
]

export const projects = [
  {
    kind: 'Automation platform',
    title: 'StudentConnect',
    text: 'Pulls jobs from 35 company career systems, scores how well each fits a student with LLMs, and sends scheduled email digests. Built so a failed fetch never closes live jobs and no email is ever sent twice.',
    points: [
      'Rejects invalid AI output before users ever see it',
      'Falls back to a second AI provider when rate-limited',
      '229 offline tests, scheduled runs on GitHub Actions',
    ],
    tags: ['Python', 'Flask', 'SQLite', 'Groq / Gemini', 'GitHub Actions'],
  },
  {
    kind: 'Full-stack web app',
    title: 'Emotion-Aware Journal',
    text: 'A journaling app that understands the emotion in each entry using a fine-tuned transformer model and keyword extraction, with live syncing across devices.',
    points: [
      'Lifted average session engagement by 30%',
      'Async FastAPI backend for fast model responses',
      'Real-time Firebase sync for 100+ concurrent entries',
    ],
    tags: ['React', 'FastAPI', 'PyTorch', 'HuggingFace', 'Firebase'],
  },
]

export const why = [
  {
    title: 'One person, start to finish',
    text: 'No hand-offs between designer, developer and tester. You talk to the person building your site.',
  },
  {
    title: 'Built not to break',
    text: 'My background is in testing edge cases and handling failures gracefully, so your site behaves when things go wrong.',
  },
  {
    title: 'Modern, fast stack',
    text: 'React, Python and automated deployments: the same tools used on production apps.',
  },
  {
    title: 'AI-ready when you are',
    text: 'If your idea needs smart features, I can build them in rather than refer you elsewhere.',
  },
]

export const skills = [
  { group: 'Frontend', items: ['JavaScript', 'React', 'HTML & CSS', 'GSAP', 'Three.js'] },
  { group: 'Backend', items: ['Python', 'FastAPI', 'Flask', 'REST APIs'] },
  { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'SQL', 'Firebase', 'SQLite'] },
  { group: 'AI / ML', items: ['LLM APIs (Gemini, Groq)', 'HuggingFace', 'PyTorch', 'spaCy'] },
  { group: 'Delivery', items: ['Git', 'GitHub Actions', 'CI/CD', 'Docker (fundamentals)'] },
]

export const credentials = [
  { label: 'Experience', title: 'Android Developer', detail: 'OneBanc Technologies' },
  { label: 'Education', title: 'B.Tech CSE (AI & ML)', detail: 'UPES, Dehradun · CGPA 8.0' },
  { label: 'Recognition', title: '2nd place, IBM Ice Day', detail: 'Published research paper, 2026' },
]

export const faq = [
  {
    q: 'What do you need from me to get started?',
    a: 'A short brief: what the site is for, who it is for, and any websites you like. If you have not figured that out yet, we will shape it together in the first conversation.',
  },
  {
    q: 'How long will my project take?',
    a: 'It depends on the size of the site and the features you need. After we talk, I will give you a clear time estimate before anything starts.',
  },
  {
    q: 'How much does it cost?',
    a: 'Pricing depends on scope. Send me your requirements through the contact form and I will get back to you with a quote.',
  },
  {
    q: 'Can you handle everything, including hosting?',
    a: 'Yes. Design, development, testing, domain and hosting setup, and deployment are all part of the end-to-end service.',
  },
  {
    q: 'What happens after the site is live?',
    a: 'You are not left on your own. Reach out any time for fixes or updates, and we can agree on ongoing maintenance if you want it.',
  },
]
