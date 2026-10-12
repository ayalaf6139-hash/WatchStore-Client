// איור SVG של שעון במקום תמונה אמיתית. הצבע נקבע לפי המותג
const BRAND_COLORS = {
  Rolex: ['#0b5d3b', '#c9a227'],
  Omega: ['#1d3557', '#c0c0c0'],
  Casio: ['#222222', '#e63946'],
  Seiko: ['#14213d', '#fca311'],
  Tissot: ['#3d405b', '#e0e1dd'],
  Fossil: ['#7f5539', '#ddb892'],
  Garmin: ['#111111', '#00a6fb']
};

function colorsFor(brand) {
  if (BRAND_COLORS[brand]) return BRAND_COLORS[brand];

  // מותג לא מוכר: צבע קבוע שנגזר מהשם
  let hash = 0;
  for (const ch of brand ?? '') hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return [`hsl(${hash} 45% 30%)`, `hsl(${(hash + 40) % 360} 60% 70%)`];
}

export default function WatchImage({ brand, size = 96 }) {
  const [dial, accent] = colorsFor(brand);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`שעון ${brand}`}>
      <rect x="38" y="2" width="24" height="22" rx="4" fill={accent} opacity="0.85" />
      <rect x="38" y="76" width="24" height="22" rx="4" fill={accent} opacity="0.85" />
      <circle cx="50" cy="50" r="31" fill={accent} />
      <circle cx="50" cy="50" r="26" fill={dial} />
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            x1={50 + Math.sin(angle) * 21}
            y1={50 - Math.cos(angle) * 21}
            x2={50 + Math.sin(angle) * 24}
            y2={50 - Math.cos(angle) * 24}
            stroke={accent}
            strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
          />
        );
      })}
      <line x1="50" y1="50" x2="50" y2="34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="62" y2="56" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2" fill={accent} />
      <rect x="80" y="47" width="5" height="6" rx="1" fill={accent} />
    </svg>
  );
}
