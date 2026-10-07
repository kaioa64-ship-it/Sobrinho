/**
 * Transparent Product Packshots for Agricultural Retail Ads
 * High-definition transparent SVG packshots designed specifically to sit directly on dark/light
 * retail backgrounds with zero white box, realistic lighting, and pure transparent alpha.
 */

// Pulverizador Costal XP 16 - 16 Litros
export const PULVERIZADOR_XP16_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700">
  <defs>
    <!-- Tank Yellow/Amber Gradient -->
    <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E59B00" />
      <stop offset="25%" stop-color="#FFBE1A" />
      <stop offset="65%" stop-color="#FFA800" />
      <stop offset="90%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>

    <!-- Highlight Reflection on Tank -->
    <linearGradient id="specularGleam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0.1)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient>

    <!-- Dark Plastic / Base Gradient -->
    <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D3748" />
      <stop offset="100%" stop-color="#1A202C" />
    </linearGradient>

    <!-- Metal Wand Brass Gradient -->
    <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>

    <!-- Blue Cap / Lever Gradient -->
    <linearGradient id="bluePlasticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="60%" stop-color="#0369A1" />
      <stop offset="100%" stop-color="#075985" />
    </linearGradient>

    <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Padded Shoulder Straps (Behind) -->
  <path d="M150,150 C120,240 100,380 130,520 C135,540 150,545 155,530 C160,400 170,250 185,160 Z" fill="#1E293B" opacity="0.9" />
  <path d="M350,150 C380,240 400,380 370,520 C365,540 350,545 345,530 C340,400 330,250 315,160 Z" fill="#1E293B" opacity="0.9" />

  <!-- Pumping Steel Lever (Left side) -->
  <path d="M100,520 L60,400 L60,330 L80,330 L80,390 L115,505 Z" fill="#64748B" />
  <rect x="45" y="315" width="40" height="22" rx="6" fill="#0F172A" />
  <circle cx="110" cy="515" r="10" fill="#334155" />

  <!-- Main Polyethylene Ergonomic Tank -->
  <path d="M160,140 C175,130 205,125 250,125 C295,125 325,130 340,140 C370,165 390,210 395,290 C400,380 395,480 380,530 C370,555 350,565 320,568 C280,570 220,570 180,568 C150,565 130,555 120,530 C105,480 100,380 105,290 C110,210 130,165 160,140 Z" fill="url(#tankGrad)" filter="url(#shadowFilter)" />

  <!-- Specular Reflection Curve on Tank -->
  <path d="M165,150 C185,140 215,135 250,135 C240,180 235,320 235,510 C215,510 190,505 170,490 C155,440 150,320 155,230 C158,190 162,165 165,150 Z" fill="url(#specularGleam)" opacity="0.45" />

  <!-- Volume Scale Grooves (16L, 12L, 8L, 4L) -->
  <g stroke="#92400E" stroke-width="2.5" opacity="0.65" stroke-linecap="round">
    <line x1="150" y1="260" x2="175" y2="260" />
    <line x1="150" y1="320" x2="175" y2="320" />
    <line x1="150" y1="380" x2="175" y2="380" />
    <line x1="150" y1="440" x2="175" y2="440" />
  </g>
  <text x="182" y="264" font-family="'Exo 2', sans-serif" font-weight="900" font-size="12" fill="#92400E" opacity="0.75">16 L</text>
  <text x="182" y="324" font-family="'Exo 2', sans-serif" font-weight="800" font-size="10" fill="#92400E" opacity="0.6">12 L</text>
  <text x="182" y="384" font-family="'Exo 2', sans-serif" font-weight="800" font-size="10" fill="#92400E" opacity="0.6">8 L</text>

  <!-- Product Label Badge on Tank: "XP 16 PROFISSIONAL" -->
  <g transform="translate(195, 330)">
    <rect x="0" y="0" width="110" height="85" rx="10" fill="#001C71" stroke="#FFAB00" stroke-width="2" />
    <rect x="5" y="5" width="100" height="24" rx="4" fill="#004D40" />
    <text x="55" y="21" font-family="'Exo 2', sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">COAGRO</text>
    <text x="55" y="48" font-family="'Exo 2', sans-serif" font-weight="900" font-size="18" fill="#FFAB00" text-anchor="middle">XP 16</text>
    <text x="55" y="65" font-family="'Inter', sans-serif" font-weight="700" font-size="8" fill="#E2E8F0" text-anchor="middle" letter-spacing="0.5">COSTAL PRO</text>
    <text x="55" y="77" font-family="'Inter', sans-serif" font-weight="600" font-size="7" fill="#38BDF8" text-anchor="middle">PRESSÃO CONTÍNUA</text>
  </g>

  <!-- Heavy Duty Molded Base Stand -->
  <path d="M125,525 C140,560 170,575 250,575 C330,575 360,560 375,525 L375,550 C365,580 325,595 250,595 C175,595 135,580 125,550 Z" fill="url(#baseGrad)" />
  <rect x="140" y="575" width="40" height="15" rx="3" fill="#0F172A" />
  <rect x="320" y="575" width="40" height="15" rx="3" fill="#0F172A" />

  <!-- Top Neck & Extra-Wide Filler Cap -->
  <rect x="220" y="98" width="60" height="30" rx="4" fill="#1E293B" />
  <!-- Large Blue Threaded Cap with Grip Ridges -->
  <path d="M205,75 L295,75 C305,75 310,82 310,92 L310,105 C310,108 305,110 295,110 L205,110 C195,110 190,108 190,105 L190,92 C190,82 195,75 205,75 Z" fill="url(#bluePlasticGrad)" filter="url(#shadowFilter)" />
  <!-- Cap Grip Ribs -->
  <g stroke="#0369A1" stroke-width="3" opacity="0.6">
    <line x1="215" y1="80" x2="215" y2="105" />
    <line x1="230" y1="80" x2="230" y2="105" />
    <line x1="250" y1="80" x2="250" y2="105" />
    <line x1="270" y1="80" x2="270" y2="105" />
    <line x1="285" y1="80" x2="285" y2="105" />
  </g>
  <!-- Pressure Release Valve atop Cap -->
  <circle cx="250" cy="85" r="7" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5" />

  <!-- Reinforced High-Pressure Flexible Hose (Right side loop) -->
  <path d="M375,520 C420,530 450,470 440,360 C430,270 415,220 375,190" fill="none" stroke="#1E293B" stroke-width="12" stroke-linecap="round" />
  <path d="M375,520 C420,530 450,470 440,360 C430,270 415,220 375,190" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round" opacity="0.6" />

  <!-- Spray Trigger Handle & Brass Lance Wand (Front/Right Angle) -->
  <g transform="translate(350, 160) rotate(14)">
    <!-- Ergonomic Trigger Grip -->
    <path d="M0,80 L20,70 L28,125 L12,130 Z" fill="#0F172A" />
    <path d="M5,95 Q-12,110 8,118" fill="none" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round" />
    <!-- Valve Body -->
    <rect x="15" y="65" width="22" height="35" rx="5" fill="url(#bluePlasticGrad)" />
    <!-- Pressure Gauge Mini Dial -->
    <circle cx="36" cy="72" r="8" fill="#F8FAFC" stroke="#0F172A" stroke-width="2" />
    <line x1="36" y1="72" x2="39" y2="69" stroke="#DC2626" stroke-width="1.5" />
    <!-- Brass Wand -->
    <rect x="23" y="-120" width="6" height="190" rx="3" fill="url(#brassGrad)" />
    <!-- Precision Fan / Cone Nozzle -->
    <path d="M20,-125 L32,-125 L30,-140 L22,-140 Z" fill="#CA8A04" />
    <circle cx="26" cy="-142" r="4" fill="#EAB308" />
  </g>
</svg>
`)}`;

// Ensiladeira & Forrageira Agro - Packshot Vetorial Transparente de Alta Resolução
export const FORRAGEIRA_ENSILADEIRA_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <!-- Machinery Green Gradient -->
    <linearGradient id="agroGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E" />
      <stop offset="40%" stop-color="#16A34A" />
      <stop offset="80%" stop-color="#15803D" />
      <stop offset="100%" stop-color="#14532D" />
    </linearGradient>

    <!-- Hopper / Chute Yellow Gradient -->
    <linearGradient id="chuteYellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FACC15" />
      <stop offset="40%" stop-color="#EAB308" />
      <stop offset="85%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#A16207" />
    </linearGradient>

    <!-- Heavy Cast Iron / Electric Motor Gradient -->
    <linearGradient id="motorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Steel Pulley & Belt -->
    <linearGradient id="steelPulleyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="50%" stop-color="#64748B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <filter id="forrShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Heavy Steel Support Stand (Legs & Crossbars) -->
  <g id="stand-frame" stroke="#0F172A" stroke-width="4">
    <!-- Rear Left Leg -->
    <line x1="210" y1="410" x2="170" y2="650" stroke="#1E293B" stroke-width="16" stroke-linecap="round" />
    <!-- Rear Right Leg -->
    <line x1="390" y1="410" x2="430" y2="650" stroke="#1E293B" stroke-width="16" stroke-linecap="round" />
    <!-- Cross Bracing -->
    <line x1="185" y1="560" x2="415" y2="560" stroke="#334155" stroke-width="10" stroke-linecap="round" />
    <line x1="185" y1="560" x2="415" y2="460" stroke="#1E293B" stroke-width="7" />
    <!-- Rubber Vibration Foot Pads -->
    <rect x="150" y="645" width="40" height="16" rx="4" fill="#090D16" />
    <rect x="410" y="645" width="40" height="16" rx="4" fill="#090D16" />
    <rect x="195" y="660" width="40" height="16" rx="4" fill="#090D16" />
    <rect x="365" y="660" width="40" height="16" rx="4" fill="#090D16" />
    <!-- Front Left Leg -->
    <line x1="240" y1="420" x2="215" y2="665" stroke="#334155" stroke-width="18" stroke-linecap="round" />
    <!-- Front Right Leg -->
    <line x1="360" y1="420" x2="385" y2="665" stroke="#334155" stroke-width="18" stroke-linecap="round" />
    <!-- Lower Front Brace -->
    <line x1="220" y1="580" x2="380" y2="580" stroke="#475569" stroke-width="12" stroke-linecap="round" />
  </g>

  <!-- Industrial Electric Motor (Left Mount) -->
  <g id="electric-motor" filter="url(#forrShadow)">
    <rect x="130" y="360" width="130" height="85" rx="10" fill="url(#motorGrad)" />
    <!-- Motor Cooling Fins -->
    <g stroke="#334155" stroke-width="2.5" opacity="0.8">
      <line x1="145" y1="360" x2="145" y2="445" />
      <line x1="160" y1="360" x2="160" y2="445" />
      <line x1="175" y1="360" x2="175" y2="445" />
      <line x1="190" y1="360" x2="190" y2="445" />
      <line x1="205" y1="360" x2="205" y2="445" />
      <line x1="220" y1="360" x2="220" y2="445" />
    </g>
    <!-- Terminal Box on Motor -->
    <rect x="160" y="340" width="45" height="22" rx="4" fill="#0F172A" />
    <!-- Rear Fan Cowl -->
    <path d="M130,370 C115,375 115,430 130,435 Z" fill="#0F172A" />
    <!-- Motor Shaft & Pulley -->
    <circle cx="260" cy="402" r="24" fill="url(#steelPulleyGrad)" />
    <circle cx="260" cy="402" r="10" fill="#0F172A" />
  </g>

  <!-- Main Cutting Drum & Rotor Housing (Center Heavy Body) -->
  <g id="rotor-housing" filter="url(#forrShadow)">
    <!-- Cylindrical Cutting Housing -->
    <circle cx="360" cy="340" r="110" fill="url(#agroGreenGrad)" stroke="#14532D" stroke-width="4" />
    <circle cx="360" cy="340" r="95" fill="#14532D" opacity="0.25" />
    
    <!-- Central Heavy-Duty Rotor Hub & Bearing Box -->
    <circle cx="360" cy="340" r="42" fill="url(#steelPulleyGrad)" stroke="#1E293B" stroke-width="3" />
    <circle cx="360" cy="340" r="28" fill="#1E293B" />
    <!-- Grease Fitting Nipple & Hex Bolts -->
    <circle cx="360" cy="340" r="6" fill="#FACC15" />
    <circle cx="360" cy="318" r="4" fill="#E2E8F0" />
    <circle cx="382" cy="340" r="4" fill="#E2E8F0" />
    <circle cx="360" cy="362" r="4" fill="#E2E8F0" />
    <circle cx="338" cy="340" r="4" fill="#E2E8F0" />

    <!-- Twin V-Belts Connecting Motor to Cutting Rotor -->
    <path d="M260,385 L350,320 L350,360 L260,420 Z" fill="#0F172A" opacity="0.8" />
    <path d="M260,390 L345,330" stroke="#090D16" stroke-width="8" stroke-linecap="round" />
    <path d="M260,415 L345,355" stroke="#090D16" stroke-width="8" stroke-linecap="round" />
  </g>

  <!-- Coagro Machinery Official Metal Badge -->
  <g transform="translate(305, 375)">
    <rect x="0" y="0" width="110" height="50" rx="6" fill="#001C71" stroke="#FFAB00" stroke-width="2" />
    <text x="55" y="20" font-family="'Exo 2', sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">COAGRO</text>
    <text x="55" y="35" font-family="'Exo 2', sans-serif" font-weight="900" font-size="11" fill="#FFAB00" text-anchor="middle">FORRAGEIRA JF</text>
    <text x="55" y="44" font-family="'Inter', sans-serif" font-weight="700" font-size="7" fill="#E2E8F0" text-anchor="middle">CORTE PRECISO</text>
  </g>

  <!-- Feed Funnel / Funil de Alimentação de Capim e Grãos (Right Upper) -->
  <g id="infeed-hopper" filter="url(#forrShadow)">
    <!-- Funnel Body -->
    <path d="M430,280 L560,200 L530,140 L400,240 Z" fill="url(#chuteYellowGrad)" stroke="#B45309" stroke-width="3" />
    <!-- Funnel Opening Lip -->
    <polygon points="560,200 580,210 550,150 530,140" fill="#FDE047" opacity="0.9" />
    <!-- Feed Throat Reinforcement Ribs -->
    <line x1="440" y1="260" x2="520" y2="190" stroke="#92400E" stroke-width="3" opacity="0.6" />
    <line x1="420" y1="275" x2="480" y2="230" stroke="#92400E" stroke-width="3" opacity="0.6" />
  </g>

  <!-- Curved Discharge Spout / Bica de Saída Direcionável (Top Arch) -->
  <g id="discharge-chute" filter="url(#forrShadow)">
    <!-- Curved Pipe -->
    <path d="M310,250 C290,180 290,110 350,60 C380,35 430,40 460,70 L440,95 C420,75 385,75 365,95 C335,130 335,190 350,240 Z" fill="url(#chuteYellowGrad)" stroke="#B45309" stroke-width="3" />
    <!-- Deflector Flap at Spout Exit -->
    <path d="M440,65 L485,75 L475,105 L430,95 Z" fill="#FACC15" stroke="#92400E" stroke-width="2" />
    <circle cx="445" cy="80" r="4" fill="#1E293B" />
    <!-- Directional Control Lever -->
    <line x1="445" y1="80" x2="430" y2="45" stroke="#1E293B" stroke-width="5" stroke-linecap="round" />
    <circle cx="430" cy="45" r="7" fill="#DC2626" />
  </g>
</svg>
`)}`;
