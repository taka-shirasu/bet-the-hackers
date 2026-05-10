export type Teammate = {
  name: string;
  role: string;
  linkedin: string;
};

export type TeamProfile = {
  id: string;
  name: string;
  work: string;
  winScore: number;
  likelihood: {
    field: number;
    judge: number;
    market: number;
  };
  likelihoodReasons?: {
    field: string;
    judge: string;
    market: string;
  };
  image: string;
  team: Teammate[];
  color: string;
};

type RawTeam = Partial<TeamProfile> & {
  _id?: { toString: () => string };
  id?: string | number;
};

export const fallbackTeams: TeamProfile[] = [
  {
    id: "signal-syndicate",
    name: "Signal Syndicate",
    work:
      "A real-time command center that turns betting odds, social signals, and injury news into explainable picks.",
    winScore: 88,
    likelihood: {
      field: 91,
      judge: 86,
      market: 88
    },
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1100&q=80",
    team: [
      { name: "Maya Chen", role: "ML systems", linkedin: "https://linkedin.com" },
      { name: "Jon Bell", role: "Product design", linkedin: "https://linkedin.com" },
      { name: "Ari Okafor", role: "Backend", linkedin: "https://linkedin.com" }
    ],
    color: "#ff4458"
  },
  {
    id: "patch-party",
    name: "Patch Party",
    work:
      "A GitHub agent that finds vulnerable dependencies, opens safe patches, and explains risk in founder-friendly language.",
    winScore: 82,
    likelihood: {
      field: 80,
      judge: 90,
      market: 76
    },
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1100&q=80",
    team: [
      { name: "Nico Ramos", role: "Full-stack", linkedin: "https://linkedin.com" },
      { name: "Priya Shah", role: "Security", linkedin: "https://linkedin.com" },
      { name: "Leo Martins", role: "Growth", linkedin: "https://linkedin.com" }
    ],
    color: "#12b886"
  },
  {
    id: "room-tone",
    name: "Room Tone",
    work:
      "A lightweight assistant that joins hackathon standups, extracts blockers, and turns decisions into Linear tickets.",
    winScore: 76,
    likelihood: {
      field: 73,
      judge: 79,
      market: 76
    },
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=80",
    team: [
      { name: "Cam Lee", role: "Voice AI", linkedin: "https://linkedin.com" },
      { name: "Sam Rivera", role: "Frontend", linkedin: "https://linkedin.com" },
      { name: "Inez Ford", role: "PM", linkedin: "https://linkedin.com" }
    ],
    color: "#228be6"
  },
  {
    id: "nudge-cart",
    name: "Nudge Cart",
    work:
      "A storefront widget that predicts why shoppers hesitate and generates tailored offers before they abandon cart.",
    winScore: 84,
    likelihood: {
      field: 81,
      judge: 82,
      market: 91
    },
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1100&q=80",
    team: [
      { name: "Elena Park", role: "Commerce", linkedin: "https://linkedin.com" },
      { name: "Drew Kim", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Omar Diaz", role: "Design", linkedin: "https://linkedin.com" }
    ],
    color: "#f59f00"
  },
  {
    id: "proof-garden",
    name: "Proof Garden",
    work:
      "A traceability layer that checks supplier evidence and turns sustainability claims into auditable product badges.",
    winScore: 71,
    likelihood: {
      field: 68,
      judge: 74,
      market: 72
    },
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=80",
    team: [
      { name: "Talia Moss", role: "Ops", linkedin: "https://linkedin.com" },
      { name: "Ben Yu", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Noor Ali", role: "Frontend", linkedin: "https://linkedin.com" }
    ],
    color: "#7c3aed"
  }
];

export function normalizeTeams(docs: RawTeam[]): TeamProfile[] {
  return docs
    .map((doc, index) => {
      if (!doc.name || !doc.work) {
        return null;
      }

      const fallback = fallbackTeams[index % fallbackTeams.length];
      const likelihood = doc.likelihood ?? fallback.likelihood;
      const team = Array.isArray(doc.team) ? doc.team : fallback.team;

      return {
        id: String(doc.id ?? doc._id?.toString() ?? doc.name),
        name: doc.name,
        work: doc.work,
        winScore: clampScore(doc.winScore ?? averageScore(likelihood)),
        likelihood: {
          field: clampScore(likelihood.field ?? fallback.likelihood.field),
          judge: clampScore(likelihood.judge ?? fallback.likelihood.judge),
          market: clampScore(likelihood.market ?? fallback.likelihood.market)
        },
        image: doc.image ?? fallback.image,
        team: team.map((member, memberIndex) => ({
          name: member.name ?? `Teammate ${memberIndex + 1}`,
          role: member.role ?? "Builder",
          linkedin: member.linkedin ?? "https://linkedin.com"
        })),
        color: doc.color ?? fallback.color
      };
    })
    .filter((team): team is TeamProfile => Boolean(team));
}

function averageScore(likelihood: TeamProfile["likelihood"]) {
  return Math.round((likelihood.field + likelihood.judge + likelihood.market) / 3);
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
