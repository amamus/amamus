export interface HomeContent {
  hero: { eyebrow: string; title: string; intro: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string } };
  whatWeDo: { id: string; heading: string; intro: string; cards: { title: string; text: string; glyph: 'shell' | 'rings' | 'horizon' }[] };
  philosophy: { id: string; heading: string; statement: string; body: string; snailNote: string; themes: { label: string; text: string }[] };
  about: { id: string; heading: string; paragraphs: string[] };
  contact: { id: string; heading: string; text: string; placeholder: string };
}

export const home: HomeContent = {
  hero: {
    eyebrow: 'amamus iocum',
    title: 'Life is too short for short-term thinking.',
    intro: 'We build digital products, invest in promising ideas, and think ahead. Because a better future should give us more freedom to enjoy life.',
    primaryCta: { label: 'What we do', href: '#what-we-do' },
    secondaryCta: { label: 'Our philosophy', href: '#philosophy' },
  },
  whatWeDo: {
    id: 'what-we-do',
    heading: 'What we do',
    intro: 'Three activities, one direction: building a future that gives us more freedom.',
    cards: [
      { title: 'Digital Products & Services', text: 'We create useful technology, practical software, and digital services — built to last and genuinely helpful.', glyph: 'shell' },
      { title: 'Investments', text: 'We support promising startups, scale-ups, and long-term entrepreneurial opportunities — with conviction, judgment, and patience.', glyph: 'rings' },
      { title: 'Financial Independence', text: 'We build sustainable financial independence through entrepreneurship and thoughtful investing — so life can be enjoyed, not just planned for.', glyph: 'horizon' },
    ],
  },
  philosophy: {
    id: 'philosophy',
    heading: 'Our philosophy',
    statement: 'Take the future seriously. Enjoy the journey.',
    body: 'Public pension systems may not provide the income we want in retirement. So we take responsibility ourselves: entrepreneurship and long-term investment are our path to freedom of choice.',
    snailNote: 'Like our snail: progress doesn’t have to be fast — it has to take you somewhere worth going. We move at our own pace, carry what we need, and enjoy the path.',
    themes: [
      { label: 'Financial independence', text: 'Building our own safety net instead of relying on systems that may not deliver.' },
      { label: 'Patient capital', text: 'Conviction over speculation — we back businesses built to last.' },
      { label: 'Entrepreneurship', text: 'Creating value by building things ourselves.' },
      { label: 'Digital autonomy', text: 'Owning our tools and data, not renting our foundations.' },
      { label: 'Freedom of choice', text: 'More options tomorrow, because we decided today.' },
      { label: 'Quality of life', text: 'The whole point — time to actually enjoy life.' },
      { label: 'Long-term thinking', text: 'Progress doesn’t always need to be fast. It needs to take you somewhere worth going.' },
      { label: 'Enjoyment', text: 'Serious about the future, never serious about life.' },
    ],
  },
  about: {
    id: 'about',
    heading: 'About',
    paragraphs: [
      'amamus iocum is an independent venture connecting technology, investments, and long-term financial independence.',
      'We build and operate digital products and services, invest in promising entrepreneurial businesses, and work toward a future where we can enjoy life on our own terms.',
      'We keep things deliberately small and independent — and we only publish what we can stand behind.',
    ],
  },
  contact: {
    id: 'contact',
    heading: 'Contact',
    text: 'We’d love to hear from you — about products, ideas, or the future in general.',
    placeholder: 'Our contact address is being set up and will be published here.',
  },
};
