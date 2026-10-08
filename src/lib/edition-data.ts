/* Editorial data from the Signal / Shift edition. Wording is unchanged. */
export type Person = {
  n: string;
  name: string;
  role: string;
  cat: "builder" | "research" | "governance";
  then: string;
  now: string;
  next: string;
  initials: string;
  photo: string;
};

export type Company = {
  n: string;
  name: string;
  cat: "compute" | "intelligence" | "industry" | "frontier" | "platforms";
  blurb: string;
  href: string;
};

export type Job = {
  title: string;
  summary: string;
  signal: string;
  edge: string;
  icon: string;
};

export const people: Person[] = [
  {
    "n": "01",
    "name": "Jensen Huang",
    "role": "Founder & CEO · NVIDIA",
    "cat": "builder",
    "then": "Built a graphics-chip company into the engine room of accelerated computing.",
    "now": "GPU platforms power a large share of the AI infrastructure build-out.",
    "next": "Scaling compute while confronting energy, supply and competition constraints.",
    "initials": "JH",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Jensen_Huang_2023.jpg/240px-Jensen_Huang_2023.jpg"
  },
  {
    "n": "02",
    "name": "Demis Hassabis",
    "role": "Co-founder & CEO · Google DeepMind",
    "cat": "research",
    "then": "A game designer turned neuroscientist and AI researcher; co-founded DeepMind.",
    "now": "Leads frontier AI research spanning models, science and products.",
    "next": "Turning AI research into scientific tools while addressing safety and deployment.",
    "initials": "DH",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Demis_Hassabis_2018.jpg/240px-Demis_Hassabis_2018.jpg"
  },
  {
    "n": "03",
    "name": "Sam Altman",
    "role": "CEO · OpenAI",
    "cat": "builder",
    "then": "Startup founder and investor before leading OpenAI through the public launch of generative AI.",
    "now": "Steers a major model and product platform amid intense competition.",
    "next": "Compute scale, product distribution and governance remain defining decisions.",
    "initials": "SA",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sam_Altman_in_2023.jpg/240px-Sam_Altman_in_2023.jpg"
  },
  {
    "n": "04",
    "name": "Dario Amodei",
    "role": "CEO · Anthropic",
    "cat": "governance",
    "then": "A physicist and AI researcher who helped build large language models before co-founding Anthropic.",
    "now": "Leads a frontier lab that emphasizes model capability and safety research.",
    "next": "Making safety commitments operational as models and enterprise adoption scale.",
    "initials": "DA",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Dario_Amodei_2024.jpg/240px-Dario_Amodei_2024.jpg"
  },
  {
    "n": "05",
    "name": "Satya Nadella",
    "role": "Chairman & CEO · Microsoft",
    "cat": "builder",
    "then": "Joined Microsoft in 1992; led cloud and enterprise businesses before becoming CEO in 2014.",
    "now": "Reorients products and infrastructure around cloud and generative AI.",
    "next": "Integrating AI into work software while balancing partners, costs and trust.",
    "initials": "SN",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Satya_Nadella_2017.jpg/240px-Satya_Nadella_2017.jpg"
  },
  {
    "n": "06",
    "name": "Sundar Pichai",
    "role": "CEO · Alphabet / Google",
    "cat": "builder",
    "then": "Engineer and product leader who advanced Chrome and Google apps before becoming CEO.",
    "now": "Guides a search, cloud and research ecosystem through the AI platform transition.",
    "next": "Rebuilding the interface to information while defending openness and reliability.",
    "initials": "SP",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Sundar_pichai.png/240px-Sundar_pichai.png"
  },
  {
    "n": "07",
    "name": "Mark Zuckerberg",
    "role": "Founder & CEO · Meta",
    "cat": "builder",
    "then": "Founded Facebook as a student project; expanded it into a global social platform.",
    "now": "Pursues open models, AI features, smart glasses and long-horizon hardware bets.",
    "next": "Whether AI assistants and new interfaces can create durable utility at scale.",
    "initials": "MZ",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mark_Zuckerberg_F8_2018_Keynote_%28cropped%29.jpg/240px-Mark_Zuckerberg_F8_2018_Keynote_%28cropped%29.jpg"
  },
  {
    "n": "08",
    "name": "Elon Musk",
    "role": "Founder · SpaceX, Tesla & xAI",
    "cat": "builder",
    "then": "Built and led ventures in electric vehicles, private spaceflight and online payments.",
    "now": "Drives work across launch systems, autonomous vehicles, AI and satellite connectivity.",
    "next": "The scale and safety of autonomy, AI, and space infrastructure will shape his impact.",
    "initials": "EM",
    "photo": "https://en.wikipedia.org/wiki/Special:FilePath/Elon_Musk_Royal_Society.jpg"
  },
  {
    "n": "09",
    "name": "Fei-Fei Li",
    "role": "Co-director · Stanford HAI",
    "cat": "research",
    "then": "Computer scientist whose ImageNet work helped catalyze modern computer vision.",
    "now": "Researches human-centered AI and advocates for broad participation in AI governance.",
    "next": "Connecting AI capability to human context, public benefit and accountable use.",
    "initials": "FL",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Fei-Fei_Li_at_TED_2015.jpg/240px-Fei-Fei_Li_at_TED_2015.jpg"
  },
  {
    "n": "10",
    "name": "Yann LeCun",
    "role": "AI researcher · NYU / AMI",
    "cat": "research",
    "then": "Pioneer of convolutional neural networks and a foundational contributor to deep learning.",
    "now": "Champions world-model approaches and research beyond next-token prediction.",
    "next": "Testing whether systems that learn physical reality can unlock more capable AI.",
    "initials": "YL",
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Yann_LeCun_2018.jpg/240px-Yann_LeCun_2018.jpg"
  }
];

export const categoryNames: Record<Company["cat"], string> = {
  "compute": "COMPUTE & CHIPS",
  "intelligence": "AI & MODELS",
  "industry": "INDUSTRY & BIOLOGY",
  "frontier": "FRONTIER SCIENCE",
  "platforms": "DIGITAL PLATFORMS"
};

export const companies: Company[] = [
  {
    "n": "01",
    "name": "NVIDIA",
    "cat": "compute",
    "blurb": "Accelerators, software and networking anchor the AI data-center stack.",
    "href": "https://www.nvidia.com/"
  },
  {
    "n": "02",
    "name": "TSMC",
    "cat": "compute",
    "blurb": "Leading-edge foundry capacity is a chokepoint for advanced chips.",
    "href": "https://www.tsmc.com/"
  },
  {
    "n": "03",
    "name": "ASML",
    "cat": "compute",
    "blurb": "Its lithography systems enable the most advanced semiconductor manufacturing.",
    "href": "https://www.asml.com/"
  },
  {
    "n": "04",
    "name": "AMD",
    "cat": "compute",
    "blurb": "A key challenger across CPUs, GPUs and data-center accelerators.",
    "href": "https://www.amd.com/"
  },
  {
    "n": "05",
    "name": "Arm",
    "cat": "compute",
    "blurb": "Its instruction-set designs underpin mobile devices and are expanding into servers.",
    "href": "https://www.arm.com/"
  },
  {
    "n": "06",
    "name": "Broadcom",
    "cat": "compute",
    "blurb": "Custom silicon and networking connect hyperscale infrastructure.",
    "href": "https://www.broadcom.com/"
  },
  {
    "n": "07",
    "name": "Qualcomm",
    "cat": "compute",
    "blurb": "Mobile chip leadership meets on-device AI and connected edge devices.",
    "href": "https://www.qualcomm.com/"
  },
  {
    "n": "08",
    "name": "Micron",
    "cat": "compute",
    "blurb": "High-bandwidth memory is critical to feeding modern AI accelerators.",
    "href": "https://www.micron.com/"
  },
  {
    "n": "09",
    "name": "Samsung Electronics",
    "cat": "compute",
    "blurb": "Memory, foundry and device scale span the semiconductor value chain.",
    "href": "https://www.samsung.com/"
  },
  {
    "n": "10",
    "name": "Intel",
    "cat": "compute",
    "blurb": "Manufacturing recovery and new AI silicon could reshape chip competition.",
    "href": "https://www.intel.com/"
  },
  {
    "n": "11",
    "name": "OpenAI",
    "cat": "intelligence",
    "blurb": "Frontier models and widely used products set the pace for generative AI adoption.",
    "href": "https://openai.com/"
  },
  {
    "n": "12",
    "name": "Anthropic",
    "cat": "intelligence",
    "blurb": "Model capability, enterprise tools and safety research shape a major frontier lab.",
    "href": "https://www.anthropic.com/"
  },
  {
    "n": "13",
    "name": "Google DeepMind",
    "cat": "intelligence",
    "blurb": "Research across foundation models, science and multimodal systems.",
    "href": "https://deepmind.google/"
  },
  {
    "n": "14",
    "name": "Meta",
    "cat": "intelligence",
    "blurb": "Open-weight models and enormous consumer distribution influence the AI ecosystem.",
    "href": "https://ai.meta.com/"
  },
  {
    "n": "15",
    "name": "Microsoft",
    "cat": "intelligence",
    "blurb": "Cloud, developer tools and productivity software bring AI to enterprise workflows.",
    "href": "https://www.microsoft.com/"
  },
  {
    "n": "16",
    "name": "Amazon",
    "cat": "intelligence",
    "blurb": "Cloud infrastructure, custom chips and logistics automation at global scale.",
    "href": "https://www.aboutamazon.com/"
  },
  {
    "n": "17",
    "name": "Mistral AI",
    "cat": "intelligence",
    "blurb": "European model development adds competition and deployment options.",
    "href": "https://mistral.ai/"
  },
  {
    "n": "18",
    "name": "Cohere",
    "cat": "intelligence",
    "blurb": "Enterprise language models focus on private and business data use cases.",
    "href": "https://cohere.com/"
  },
  {
    "n": "19",
    "name": "xAI",
    "cat": "intelligence",
    "blurb": "A fast-growing model lab connected to a large social and compute ecosystem.",
    "href": "https://x.ai/"
  },
  {
    "n": "20",
    "name": "ByteDance",
    "cat": "intelligence",
    "blurb": "Recommendation systems, creative tools and AI reach billions of users.",
    "href": "https://www.bytedance.com/"
  },
  {
    "n": "21",
    "name": "Tesla",
    "cat": "industry",
    "blurb": "EVs, batteries, robotics and autonomy create a tightly coupled industrial bet.",
    "href": "https://www.tesla.com/"
  },
  {
    "n": "22",
    "name": "Waymo",
    "cat": "industry",
    "blurb": "Commercial robotaxi operations test whether autonomous driving can scale safely.",
    "href": "https://waymo.com/"
  },
  {
    "n": "23",
    "name": "Figure AI",
    "cat": "industry",
    "blurb": "Humanoid robots aim to bring flexible automation into existing workplaces.",
    "href": "https://www.figure.ai/"
  },
  {
    "n": "24",
    "name": "Boston Dynamics",
    "cat": "industry",
    "blurb": "Advanced mobile robots demonstrate what physical AI can do in demanding environments.",
    "href": "https://bostondynamics.com/"
  },
  {
    "n": "25",
    "name": "Siemens",
    "cat": "industry",
    "blurb": "Industrial software, automation and digital twins modernize factories.",
    "href": "https://www.siemens.com/"
  },
  {
    "n": "26",
    "name": "CATL",
    "cat": "industry",
    "blurb": "Battery manufacturing and storage affect EV costs and grid flexibility.",
    "href": "https://www.catl.com/"
  },
  {
    "n": "27",
    "name": "BYD",
    "cat": "industry",
    "blurb": "Vertically integrated EVs and batteries have transformed global auto competition.",
    "href": "https://www.byd.com/"
  },
  {
    "n": "28",
    "name": "ABB",
    "cat": "industry",
    "blurb": "Robotics and electrification equipment make factories and grids more automated.",
    "href": "https://global.abb/"
  },
  {
    "n": "29",
    "name": "Schneider Electric",
    "cat": "industry",
    "blurb": "Power management helps data centers and industry handle rising electricity demand.",
    "href": "https://www.se.com/"
  },
  {
    "n": "30",
    "name": "CRISPR Therapeutics",
    "cat": "industry",
    "blurb": "Gene-editing therapies are moving from research into regulated clinical use.",
    "href": "https://crisprtx.com/"
  },
  {
    "n": "31",
    "name": "SpaceX",
    "cat": "frontier",
    "blurb": "Reusable launch and satellite broadband lower barriers to space infrastructure.",
    "href": "https://www.spacex.com/"
  },
  {
    "n": "32",
    "name": "Blue Origin",
    "cat": "frontier",
    "blurb": "Launch systems and lunar ambitions could expand commercial access to space.",
    "href": "https://www.blueorigin.com/"
  },
  {
    "n": "33",
    "name": "Commonwealth Fusion Systems",
    "cat": "frontier",
    "blurb": "Commercial fusion efforts test the path from physics milestones to power plants.",
    "href": "https://cfs.energy/"
  },
  {
    "n": "34",
    "name": "TerraPower",
    "cat": "frontier",
    "blurb": "Advanced nuclear designs could support reliable low-carbon electricity.",
    "href": "https://www.terrapower.com/"
  },
  {
    "n": "35",
    "name": "Helion",
    "cat": "frontier",
    "blurb": "A highly ambitious fusion-to-electricity approach faces major engineering milestones.",
    "href": "https://www.helionenergy.com/"
  },
  {
    "n": "36",
    "name": "PsiQuantum",
    "cat": "frontier",
    "blurb": "Photonic quantum computing is a bet on a different route to scalable qubits.",
    "href": "https://www.psiquantum.com/"
  },
  {
    "n": "37",
    "name": "IonQ",
    "cat": "frontier",
    "blurb": "Trapped-ion quantum systems pursue accuracy and networked scaling.",
    "href": "https://ionq.com/"
  },
  {
    "n": "38",
    "name": "Rigetti Computing",
    "cat": "frontier",
    "blurb": "Superconducting quantum hardware remains a contender in early quantum systems.",
    "href": "https://www.rigetti.com/"
  },
  {
    "n": "39",
    "name": "Ginkgo Bioworks",
    "cat": "frontier",
    "blurb": "Engineering biology platforms aim to make biological design more programmable.",
    "href": "https://www.ginkgobioworks.com/"
  },
  {
    "n": "40",
    "name": "Recursion",
    "cat": "frontier",
    "blurb": "AI and high-throughput biology are being combined to accelerate drug discovery.",
    "href": "https://www.recursion.com/"
  },
  {
    "n": "41",
    "name": "Alphabet",
    "cat": "platforms",
    "blurb": "Search, Android, cloud and AI research provide global distribution and infrastructure.",
    "href": "https://abc.xyz/"
  },
  {
    "n": "42",
    "name": "Apple",
    "cat": "platforms",
    "blurb": "Devices, silicon and services give Apple control over a major consumer interface.",
    "href": "https://www.apple.com/"
  },
  {
    "n": "43",
    "name": "Cloudflare",
    "cat": "platforms",
    "blurb": "Edge networks and security sit between users, applications and the internet.",
    "href": "https://www.cloudflare.com/"
  },
  {
    "n": "44",
    "name": "Shopify",
    "cat": "platforms",
    "blurb": "Commerce software gives independent businesses digital reach and operating tools.",
    "href": "https://www.shopify.com/"
  },
  {
    "n": "45",
    "name": "Stripe",
    "cat": "platforms",
    "blurb": "Payments infrastructure powers online commerce and an expanding programmable economy.",
    "href": "https://stripe.com/"
  },
  {
    "n": "46",
    "name": "Databricks",
    "cat": "platforms",
    "blurb": "Data and AI platforms connect enterprise information to models and applications.",
    "href": "https://www.databricks.com/"
  },
  {
    "n": "47",
    "name": "Palantir",
    "cat": "platforms",
    "blurb": "Operational data software is used in government and commercial decision systems.",
    "href": "https://www.palantir.com/"
  },
  {
    "n": "48",
    "name": "Adobe",
    "cat": "platforms",
    "blurb": "Creative software is integrating generative tools into established production workflows.",
    "href": "https://www.adobe.com/"
  },
  {
    "n": "49",
    "name": "Tencent",
    "cat": "platforms",
    "blurb": "Games, cloud, payments and messaging create a large technology ecosystem.",
    "href": "https://www.tencent.com/"
  },
  {
    "n": "50",
    "name": "Reliance Industries",
    "cat": "platforms",
    "blurb": "Telecom, retail and digital services shape technology access across India.",
    "href": "https://www.ril.com/"
  }
];

export const jobs: { growing: Job[]; exposure: Job[] } = {
  "growing": [
    {
      "title": "Big data specialists",
      "summary": "Find patterns in large datasets and turn them into useful decisions.",
      "signal": "DATA ANALYSIS",
      "edge": "Data interpretation · explain findings to decision-makers",
      "icon": "📊"
    },
    {
      "title": "FinTech engineers",
      "summary": "Build software for payments, banking and financial services.",
      "signal": "SOFTWARE",
      "edge": "Secure system design · financial rules and customer trust",
      "icon": "💳"
    },
    {
      "title": "AI & machine-learning specialists",
      "summary": "Develop, test and maintain AI models and applications.",
      "signal": "AI SYSTEMS",
      "edge": "Evaluation · safety · domain knowledge",
      "icon": "🤖"
    },
    {
      "title": "Software & applications developers",
      "summary": "Design, build and maintain digital products.",
      "signal": "SOFTWARE",
      "edge": "Architecture · debugging · product judgement",
      "icon": "💻"
    },
    {
      "title": "Security management specialists",
      "summary": "Coordinate an organization’s security plans and response.",
      "signal": "SECURITY",
      "edge": "Risk decisions · incident leadership",
      "icon": "🛡️"
    },
    {
      "title": "Information security analysts",
      "summary": "Find vulnerabilities and defend networks and data.",
      "signal": "CYBERSECURITY",
      "edge": "Threat response · security strategy",
      "icon": "🔐"
    },
    {
      "title": "Autonomous & electric-vehicle specialists",
      "summary": "Develop, service and integrate electric and automated vehicles.",
      "signal": "MOBILITY",
      "edge": "Hardware diagnostics · safety validation",
      "icon": "🚗"
    },
    {
      "title": "Environmental engineers",
      "summary": "Design systems to reduce pollution and environmental harm.",
      "signal": "CLIMATE",
      "edge": "Field assessment · regulation · engineering judgement",
      "icon": "🌿"
    },
    {
      "title": "Renewable-energy engineers",
      "summary": "Plan and improve wind, solar and other clean-energy systems.",
      "signal": "ENERGY",
      "edge": "Grid integration · installation · maintenance",
      "icon": "⚡"
    },
    {
      "title": "Nursing professionals",
      "summary": "Provide clinical care, monitor patients and coordinate treatment.",
      "signal": "HEALTHCARE",
      "edge": "Hands-on care · clinical judgement · empathy",
      "icon": "🩺"
    }
  ],
  "exposure": [
    {
      "title": "Cashiers & ticket clerks",
      "summary": "Self-service checkout and digital ticketing can reduce routine transactions.",
      "signal": "TRANSACTIONS",
      "edge": "Exception handling · customer help",
      "icon": "🧾"
    },
    {
      "title": "Administrative assistants & executive secretaries",
      "summary": "Scheduling, forms and standard correspondence can be partly automated.",
      "signal": "ADMINISTRATION",
      "edge": "Coordination · discretion · people support",
      "icon": "🗓️"
    },
    {
      "title": "Postal service clerks",
      "summary": "Digital communication and automated sorting affect routine counter work.",
      "signal": "POSTAL SERVICES",
      "edge": "Complex requests · identity and parcel issues",
      "icon": "📦"
    },
    {
      "title": "Bank tellers & related clerks",
      "summary": "Mobile banking handles many standard deposits, transfers and inquiries.",
      "signal": "BANKING",
      "edge": "Fraud awareness · sensitive customer support",
      "icon": "🏦"
    },
    {
      "title": "Printing & related trades workers",
      "summary": "Digital distribution reduces some print production and processing tasks.",
      "signal": "PRINT PRODUCTION",
      "edge": "Specialist finishing · equipment operation",
      "icon": "🖨️"
    },
    {
      "title": "Accounting, bookkeeping & payroll clerks",
      "summary": "Software can process invoices, reconciliations and standard payroll steps.",
      "signal": "FINANCE OPERATIONS",
      "edge": "Exception review · compliance · audit trail",
      "icon": "📒"
    },
    {
      "title": "Graphic designers",
      "summary": "Generative tools can speed up first drafts and routine asset variations.",
      "signal": "CREATIVE WORK",
      "edge": "Original concepts · art direction · brand judgement",
      "icon": "🎨"
    },
    {
      "title": "Accountants & auditors",
      "summary": "Automated tools can prepare routine records and flag anomalies.",
      "signal": "FINANCIAL REVIEW",
      "edge": "Interpretation · assurance · professional accountability",
      "icon": "🔎"
    },
    {
      "title": "Material-recording & stock-keeping clerks",
      "summary": "Barcode systems and inventory software reduce manual record updates.",
      "signal": "INVENTORY",
      "edge": "Resolve mismatches · coordinate physical stock",
      "icon": "📋"
    },
    {
      "title": "Data-entry clerks",
      "summary": "OCR and workflow software can capture and route structured information.",
      "signal": "DATA PROCESSING",
      "edge": "Validate unusual cases · correct source errors",
      "icon": "⌨️"
    }
  ]
};

export const feedTopics = [
  {
    query: "artificial intelligence technology when:7d",
    label: "AI & SOFTWARE",
    visual: "AI",
    impact: "The practical test: does the system work reliably in a real workflow, and who checks its output?",
  },
  {
    query: "semiconductor OR chip technology when:7d",
    label: "COMPUTE & CHIPS",
    visual: "µ",
    impact: "A chip advance matters when it improves performance, cost or supply at production scale.",
  },
  {
    query: "quantum computing OR robotics OR battery technology when:7d",
    label: "FRONTIER & INDUSTRY",
    visual: "Q",
    impact: "Watch for results outside the lab: safety, reliability, cost and real-world deployment.",
  },
  {
    query: "technology regulation OR cybersecurity when:7d",
    label: "POLICY & SECURITY",
    visual: "↗",
    impact: "Look for concrete safeguards, transparency and accountability—not only public commitments.",
  },
] as const;
