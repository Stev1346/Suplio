export type PricingTier = {
    id: "starter" | "pro" | "premium";
    name: string;
    price: string;
    cadence: "month" | "event";
    isPopular?: boolean;
    includes: string[];
  };
  
  export const landingContent = {
    hero: {
      title: "Suplio",
      tagline: "Scan. Request. Vote.",
      subcopy:
        "Give your crowd a smoother way to request songs from their phones while you stay in full control with no distractions.",
      primaryCtaLabel: "Create account",
      secondaryCtaLabel: "Log in",
    },
    outcomes: [
      "Fewer booth interruptions",
      "More crowd engagement",
      "Clear control over what enters your queue",
    ],
    howItWorks: {
      guests: [
        "Scan your event QR code",
        "Request songs quickly from your phone",
        "Vote on what YOU would like to hear most",
      ],
      djs: [
        "Create your account and set up your profile",
        "Create events from your dashboard",
        "Review requests and run the night your way",
      ],
      karaoke:
        "Running karaoke? Manage singers with a clear queue for who is up now and who is next.",
    },
    pricing: <PricingTier[]>[
      {
        id: "starter",
        name: "Starter",
        price: "$0",
        cadence: "month",
        includes: ["Up to 2 events/month", "Standard support", "Guest request + voting flow"],
      },
      {
        id: "pro",
        name: "Pro",
        price: "$10",
        cadence: "month",
        isPopular: true,
        includes: ["Up to 10 events/month", "Priority support", "Karaoke queue tools"],
      },
      {
        id: "premium",
        name: "Premium",
        price: "$35",
        cadence: "month",
        includes: ["Unlimited events", "Priority support", "Advanced event control"],
      },
    ],
    footer: {
      supportEmail: "slimtymevisuals@gmail.com",
    },
    bannedWordsChecklist: [
      "Next.js",
      "Supabase",
      "RLS",
      "migration",
      "schema",
      "App Router",
    ],
  } as const;