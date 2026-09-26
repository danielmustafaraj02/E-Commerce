// Small illustrated interludes for the Murano guide. The vector scenes stay
// crisp at every size; their restrained movement lives in shop.css.
export function MuranoFurnaceArt({ caption }: { caption: string }) {
  return (
    <figure className="murano-art-scene murano-art-scene--furnace" aria-hidden="true">
      <svg viewBox="0 0 720 300" focusable="false">
        <defs>
          <linearGradient id="furnace-room" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8dfd0" />
            <stop offset="1" stopColor="#c9b89c" />
          </linearGradient>
          <linearGradient id="furnace-fire" x1="0" y1="1" x2="0.8" y2="0">
            <stop offset="0" stopColor="#b85d37" />
            <stop offset="0.52" stopColor="#f2a347" />
            <stop offset="1" stopColor="#fff0b0" />
          </linearGradient>
        </defs>
        <rect width="720" height="300" fill="url(#furnace-room)" />
        <path d="M0 236h720v64H0z" fill="#776c5e" />
        <path d="M0 235h720" stroke="#f8f0e3" strokeOpacity="0.7" strokeWidth="2" />
        <path d="M443 236V139c0-61 49-108 108-108s108 47 108 108v97" fill="#957b5c" />
        <path d="M470 236v-96c0-47 35-82 81-82s81 35 81 82v96" fill="#342e28" />
        <path d="M488 219c-14-33 9-54 18-76 9 15 6 22 12 29 2-31 19-51 38-71 1 28 14 40 19 58 7-10 13-17 23-24 1 42 19 53 5 84z" className="furnace-flame" fill="url(#furnace-fire)" />
        <path d="M450 137h20m-20 18h20m-20 18h20m-20 18h20m168-54h20m-20 18h20m-20 18h20m-20 18h20" stroke="#c7ae87" strokeOpacity="0.7" strokeWidth="2" />
        <path d="M510 32V0h82v32" fill="#786754" />
        <path d="M528 0v-22h45V0" fill="#a08d73" />
        <path d="M150 237v-67c0-9 7-16 16-16h15v83" fill="#173c3e" />
        <circle cx="171" cy="122" r="20" fill="#ad775c" />
        <path d="M150 119c1-24 38-31 47-5l-2 9h-45z" fill="#123d43" />
        <path className="furnace-worker" d="M150 153c13-13 36-13 49 0l18 76h-83z" fill="#f7f1e6" />
        <path d="M186 162c8 6 12 13 10 21" fill="none" stroke="#ad775c" strokeWidth="9" strokeLinecap="round" />
        <path d="M210 237v31m-27-1h54m404-30v31m-26-1h53" stroke="#3f3a32" strokeWidth="4" />
        <path d="M30 269h660" stroke="#b89a62" strokeOpacity="0.55" />
        <circle className="furnace-spark furnace-spark--one" cx="457" cy="119" r="3" fill="#fff0b0" />
        <circle className="furnace-spark furnace-spark--two" cx="484" cy="99" r="2" fill="#fff0b0" />
        <circle className="furnace-spark furnace-spark--three" cx="441" cy="93" r="2.5" fill="#fff0b0" />
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function MuranoSeagullArt() {
  return (
    <figure className="murano-art-scene murano-art-scene--seagull" aria-hidden="true">
      <svg viewBox="15 20 545 385" focusable="false">
        <defs>
          <linearGradient id="gull-feathers" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#d7dee0" />
            <stop offset="0.55" stopColor="#a9b3b8" />
            <stop offset="1" stopColor="#68777f" />
          </linearGradient>
          <linearGradient id="gull-neck" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.7" stopColor="#f5f5f1" />
            <stop offset="1" stopColor="#dfe2df" />
          </linearGradient>
        </defs>
        <g className="seagull-legs" fill="none" stroke="#9b6b63" strokeLinecap="round" strokeLinejoin="round">
          <path d="m353 299 4 56-4 25m-4-1c-5 2-11 4-18 5m18-5 12 6m-12-6 2 8" strokeWidth="6" />
          <path d="m389 294 1 60 8 25m-8-1c-5 3-11 4-18 5m18-5 12 6m-12-6 3 8" strokeWidth="6" />
          <path d="M342 384c-7 2-13 2-18 0m44 0c-6 2-12 2-17 0m51 0c-6 2-12 2-18 0" strokeWidth="3" />
        </g>
        <g className="seagull-tail">
          <path d="M194 266c-50 2-103 15-163 36 40 3 78 2 113-2-30 14-56 28-82 46 55-11 106-29 154-54z" fill="#22292c" />
          <path d="m43 300 58 5-39 4m4 29 53-27-24 27m8-61 39 16-27-1" fill="none" stroke="#f6f7f3" strokeLinecap="round" strokeWidth="8" />
          <path d="M95 298c28-12 54-20 79-24" fill="none" stroke="#68777f" strokeWidth="8" />
        </g>
        <g className="seagull-body">
          <path d="M99 300c31-37 89-73 158-91 49-13 99-19 128-28 15-10 22-31 25-59 3-28 2-50 13-68 9-15 24-24 42-22 20 2 33 18 32 37-1 14-9 24-20 31 8 24 21 44 25 72 5 32-10 58-40 78-41 28-107 52-174 66-62 13-132 5-189-16z" fill="url(#gull-neck)" />
          <path d="M393 186c-55 6-105 26-154 50-43 21-83 44-124 60 39 20 99 25 156 12 69-16 130-45 164-78 18-18 24-34 14-48-15-5-34-1-56 4z" fill="url(#gull-feathers)" />
          <path d="M398 184c-60 1-127 30-180 56-34 17-64 33-98 47 34-6 72-19 109-35 66-29 121-47 180-48 20-1 36 1 51 5-8-15-28-25-62-25z" fill="#f5f6f2" />
          <path d="M163 286c51-18 93-40 134-58 37-20 68-29 101-31m-208 91c49-9 91-28 135-50 37-19 64-28 93-31m-180 83c42-8 77-22 116-42 39-20 67-29 95-31" fill="none" stroke="#77858b" strokeOpacity="0.48" strokeWidth="2" />
          <path d="M224 302c52 8 105 1 152-14 31-10 58-23 77-38-29 34-76 57-133 71-51 13-103 13-149 4z" fill="#e6e9e5" opacity="0.78" />
          <path className="seagull-feather-glint" d="M177 275c48-20 91-44 137-61 30-11 53-17 81-19" fill="none" stroke="#fff" strokeOpacity="0.8" strokeLinecap="round" strokeWidth="5" />
        </g>
        <g className="seagull-head">
          <path d="M423 68c9-21 26-37 45-36 19 1 32 17 31 35-1 17-12 29-28 34-15 4-32-2-43-13z" fill="#fff" stroke="#e4e8e5" strokeWidth="1.5" />
          <path d="M429 62c9-18 25-29 40-28 10 1 18 6 24 15-13-6-27-7-41-2-8 3-15 8-23 15z" fill="#e9ece9" />
          <path d="M489 70c18 2 34 6 53 16-16 1-35 0-55-5z" fill="#d2ad4e" />
          <path d="M487 79c20 5 37 8 54 7-10 8-29 8-51 2z" fill="#b88a2d" />
          <path d="M522 82c4 1 7 2 10 3-2 4-5 6-9 7" fill="none" stroke="#b54c42" strokeWidth="2" />
          <g className="seagull-eye">
            <ellipse cx="470" cy="55" rx="6.3" ry="6.8" fill="#c1a35f" />
            <ellipse cx="471" cy="55" rx="3.6" ry="4" fill="#1e2929" />
            <circle cx="472" cy="53.7" r="1.2" fill="#fff" />
          </g>
        </g>
      </svg>
    </figure>
  );
}
