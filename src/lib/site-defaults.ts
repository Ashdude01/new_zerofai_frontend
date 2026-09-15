import type {
  BlogPageContent,
  ContactPageContent,
  FooterContent,
  KnowledgePageContent,
  LeadershipPageContent,
  NavigationContent,
  NewsroomPageContent,
} from "@/types/site-content";

const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1664474834472-6c7d1e3198e2?w=1600&auto=format&fit=crop&q=60";

export const navigationDefaults: NavigationContent = {
  logoUrl: "/assets/logo.png",
  homeSectionLinks: [
    { label: "What is ZerofAI?", href: "what-is", type: "anchor" },
    { label: "Platform", href: "platform", type: "anchor" },
    { label: "Insights", href: "insights", type: "anchor" },
  ],
  routeLinks: [
    { label: "Our Team", href: "/our-team", type: "route", showOnHomepage: true },
    { label: "Newsroom", href: "/newsroom", type: "route", showOnHomepage: true },
    { label: "Knowledge", href: "/knowledge", type: "route", showOnHomepage: true },
    { label: "Contact us", href: "/contact", type: "route", showOnHomepage: true },
  ],
};

export const footerDefaults: FooterContent = {
  logoUrl: "/assets/logo.png",
  description:
    "Engineering the next generation of neural architectures. We bridge the gap between human intuition and machine precision to build an autonomous future.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "Our Team", href: "/our-team" },
        { label: "Blogs", href: "/blog" },
        { label: "Newsroom", href: "/newsroom" },
        { label: "Knowledge Center", href: "/knowledge" },
        { label: "Customer Stories", href: "#" },
      ],
    },
    {
      title: "Quicklinks",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/termscondition" },
      ],
    },
  ],
  demoTitle: "Book a demo",
  copyright: "ZerofAI All rights reserved.",
};

export const contactPageDefaults: ContactPageContent = {
  meta: {
    title: "Contact | Request Demo | ZerofAI",
    description:
      "Connect with ZerofAI to automate compliance, monitor endpoints, and strengthen enterprise security operations in real time.",
  },
  hero: {
    eyebrow: "Get in Touch",
    title: "Contact US",
    imageUrl: HERO_IMAGE,
  },
  address: "B, 15, Block B, Noida Sector 3, Noida, Uttar Pradesh 201301",
  email: "cs@zerofai.ai",
  mapAddress: "B, 15, Block B, Noida Sector 3, Noida, Uttar Pradesh 201301",
  formSubmitLabel: "Request Demo",
  formSuccessMessage:
    "Thank you! Your message has been submitted. Our team will get back to you soon.",
};

export const leadershipPageDefaults: LeadershipPageContent = {
  meta: {
    title: "Our Team | ZerofAI",
    description: "Meet the ZerofAI leadership team driving autonomous IT operations innovation.",
  },
  hero: {
    title: "Our Team",
    subtitle: "Meet our Leadership Team",
    imageUrl: HERO_IMAGE,
  },
  members: [
    {
      name: "Ajay Sharma",
      designation: "Head - Managed Services Business",
      imageUrl: "/assets/ajay.png",
    },
    {
      name: "Nischal Maheshwari",
      designation: "Global Delivery Head",
      imageUrl: "/assets/nischal.webp",
    },
    {
      name: "Abhishek Gupta",
      designation: "Lead Solution Architect - ZerofAI",
      imageUrl: "/assets/abhishek.png",
    },
    {
      name: "Aashima Arya",
      designation: "Product Observability Manager",
      imageUrl: "/assets/aashima.webp",
    },
    {
      name: "Rishav Dev",
      designation: "Software Craftsperson",
      imageUrl: "/assets/rishav.webp",
    },
    {
      name: "Deeksha Khattar",
      designation: "Software Craftsperson",
      imageUrl: "/assets/deeksha.webp",
    },
    {
      name: "Lalit Mehta",
      designation: "Business Marketing",
      imageUrl: "/assets/lalit.webp",
    },
  ],
};

export const knowledgePageDefaults: KnowledgePageContent = {
  meta: {
    title: "Knowledge Center | ZerofAI",
    description:
      "Find answers to frequently asked questions about ZerofAI's autonomous IT operations platform and services.",
  },
  hero: {
    eyebrow: "FAQs",
    title: "Knowledge Center",
    imageUrl: HERO_IMAGE,
  },
  faqs: [
    {
      id: "what-is-zerofai",
      question: "What is ZerofAI?",
      answer:
        "ZerofAI is an AI-powered autonomous IT operations platform that helps enterprises move from reactive support to proactive and predictive digital operations. It automates issue resolution, improves workplace experience, and helps IT teams operate more efficiently at scale.",
    },
    {
      id: "vs-traditional-automation",
      question: "How is ZerofAI different from traditional IT automation?",
      answer:
        "Traditional automation follows predefined workflows and rules. ZerofAI goes further by continuously analyzing operational signals, identifying issues proactively, orchestrating remediation, and helping IT operations become more intelligent and autonomous.",
    },
    {
      id: "platform-or-service",
      question: "Is ZerofAI a platform, service, or both?",
      answer:
        "ZerofAI is both. Organizations can use it as a technology platform or combine it with ZerofAI-led operational services such as Autonomous Support Operations, Proactive Experience Operations, and Predictive Intelligence Operations.",
    },
    {
      id: "proactive-self-healing",
      question: "How does Proactive Self-Healing work?",
      answer:
        "ZerofAI continuously detects anomalies, identifies recurring endpoint issues, and triggers automated remediation workflows to resolve disruptions before they impact users or create support tickets.",
    },
    {
      id: "endpoint-governance",
      question: "What is Autonomous Endpoint Governance?",
      answer:
        "Autonomous Endpoint Governance helps organizations continuously manage endpoint compliance, security policies, provisioning, and operational health through intelligent automation and proactive control.",
    },
    {
      id: "sentiment-trend",
      question: "What does Sentiment Trend Analysis analyze?",
      answer:
        "ZerofAI analyzes workplace behavioral signals, support interactions, and digital experience patterns to identify employee frustration, dissatisfaction, and emerging experience issues early.",
    },
    {
      id: "predictive-health",
      question: "How does Predictive Health Analytics work?",
      answer:
        "ZerofAI analyzes historical operational patterns, real-time signals, and system behavior to identify early indicators of potential failures, helping teams act before disruptions occur.",
    },
    {
      id: "enterprise-customization",
      question: "Can ZerofAI be customized to fit enterprise business needs?",
      answer:
        "Yes. ZerofAI is designed to adapt to enterprise environments, workflows, and operational requirements. It can be aligned with existing ITSM platforms, endpoint ecosystems, security policies, support processes, and automation use cases to match specific business needs and operational maturity.",
    },
    {
      id: "operational-services",
      question: "What's included in ZerofAI's operational services?",
      answer:
        "ZerofAI's services combine AI-powered automation, operational intelligence, and managed execution to help enterprises improve support operations, workplace experience, and predictive decision-making across IT environments.",
    },
    {
      id: "replace-it-teams",
      question: "Does ZerofAI replace existing IT teams?",
      answer:
        "No. ZerofAI is designed to augment IT teams by reducing repetitive operational workload, improving response efficiency, and helping teams focus on strategic initiatives, governance, and higher-value operational decisions. AI operations models are increasingly positioned as augmentation layers rather than direct team replacements.",
    },
  ],
  ctaTitle: "Still have questions?",
  ctaDescription: "Our engineering team is ready to walk you through a custom demo.",
  ctaButtonLabel: "Contact Support",
  ctaButtonLink: "/contact",
};

export const blogPageDefaults: BlogPageContent = {
  meta: {
    title: "Blog | ZerofAI",
    description:
      "Insights, updates, and perspectives on autonomous IT operations from ZerofAI.",
  },
  hero: {
    eyebrow: "Insights",
    title: "Blog",
    imageUrl: "/assets/blog.webp",
  },
};

export const newsroomPageDefaults: NewsroomPageContent = {
  meta: {
    title: "Newsroom | ZerofAI",
    description:
      "Company news, announcements, and updates from ZerofAI.",
  },
  hero: {
    eyebrow: "Company News",
    title: "Newsroom",
    imageUrl: "/assets/blog.webp",
  },
};
