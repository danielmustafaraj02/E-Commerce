// A low, full-width lagoon scene using the gondolier from the Murano guide.
export function AboutGondolaArt() {
  return (
    <div className="about-gondola-scene" aria-hidden="true">
      <svg
        className="about-lagoon-svg"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="about-lagoon-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c9c99" stopOpacity="0.22" />
            <stop offset="0.55" stopColor="#4a7779" stopOpacity="0.14" />
            <stop offset="1" stopColor="#123d43" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path
          className="about-lagoon-water"
          d="M0 121c92-18 161 13 250 1s151-20 239-2 157 21 239 1 161-19 243-1 161 18 241 0 151-10 228 2v98H0Z"
          fill="url(#about-lagoon-water)"
        />
        <path
          className="about-lagoon-ripple about-lagoon-ripple--one"
          d="M-80 139c100-13 174-13 274 0s174 13 274 0 174-13 274 0 174 13 274 0 174-13 274 0 174 13 274 0"
          fill="none"
          stroke="#fffaf0"
          strokeOpacity="0.62"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="about-lagoon-ripple about-lagoon-ripple--two"
          d="M-100 184c105-10 181-10 286 0s181 10 286 0 181-10 286 0 181 10 286 0 181-10 286 0 181 10 286 0"
          fill="none"
          stroke="#b89a62"
          strokeOpacity="0.38"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="about-gondola-voyage">
        <svg className="about-gondola-art" viewBox="20 255 520 235" focusable="false">
          <g className="about-gondola-boat">
            <ellipse cx="282" cy="447" rx="172" ry="7" fill="#0b2a2e" opacity="0.16" />
            <path
              d="M86 380C120 398 190 404 280 404C370 404 430 398 474 360C462 402 404 438 284 440C170 442 112 420 86 380Z"
              fill="#102f33"
            />
            <path
              d="M100 391C170 404 380 406 462 372"
              fill="none"
              stroke="#c3a264"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M472 362q9-9 7-25" fill="none" stroke="#b89a62" strokeWidth="4" strokeLinecap="round" />
            <path d="M216 405q6-13 12 0" fill="none" stroke="#b89a62" strokeWidth="3" />

            <g className="about-gondolier">
              <path d="M151 311c5 11 14 19 25 15" fill="none" stroke="#9c6a51" strokeWidth="6" strokeLinecap="round" />
              <path d="M150 347h22l3 49h-8l-6-36-6 36h-8Z" fill="#173a3d" />
              <path d="M143 397.5h12m10 0h13" stroke="#0c2427" strokeWidth="3.4" strokeLinecap="round" />
              <path
                d="M148 313c1-6 6-8 13-8s12 2 13 8l-2 35h-22Z"
                fill="#f8f3ea"
                stroke="#123d43"
                strokeOpacity="0.35"
              />
              <path d="M150 318h22M150 326h22M150.5 334h21M150.5 342h21" stroke="#123d43" strokeWidth="2.2" />
              <path d="M150 347.5h22" stroke="#b89a62" strokeWidth="3" />
              <path d="M158 301h6v6h-6Z" fill="#ad775c" />
              <circle cx="161" cy="294" r="9.5" fill="#ad775c" />
              <path d="M150.5 283v-9q0-3 3-3h15q3 0 3 3v9Z" fill="#b89a62" />
              <path d="M150.5 279.5h21" stroke="#123d43" strokeWidth="3.5" />
              <ellipse cx="161" cy="284" rx="17" ry="3" fill="#b89a62" />
              <g className="about-gondolier-oar">
                <path d="M170 316 252 456" stroke="#4b3328" strokeWidth="5" strokeLinecap="round" />
                <path d="M245 444 254 460" stroke="#4b3328" strokeWidth="9" strokeLinecap="round" />
                <path d="M236 462q16 6 32 0" fill="none" stroke="#e2d7c3" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
              </g>
              <path d="M171 310c9 6 15 20 17 36" fill="none" stroke="#ad775c" strokeWidth="6" strokeLinecap="round" />
              <circle cx="176" cy="326" r="3.4" fill="#9c6a51" />
              <circle cx="188" cy="347" r="3.4" fill="#ad775c" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
