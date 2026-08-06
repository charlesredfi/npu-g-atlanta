import meetingAgendaData from "@/data/meeting-agenda.json";

export const navLinks = [
  { href: "#priorities", label: "Priorities" },
  { href: "#about", label: "About Us" },
  { href: "#news", label: "News" },
  { href: "#neighborhoods", label: "13 Neighborhoods" },
  { href: "#events", label: "Events" },
  { href: "#merch", label: "Merch" },
  { href: "#contact", label: "Contact Us" },
] as const;

export const priorities = [
  {
    id: "land-use",
    label: "Land Use & Zoning",
    summary:
      "Reviewing proposals so growth respects Westside character",
    highlightLabel: "Community Voice",
    highlightTitle:
      "Formal recommendations that move from NPU-G to City Council and the Mayor",
    highlightHref: "#about",
  },
  {
    id: "public-safety",
    label: "Public Safety",
    summary: "Safer streets, lighting, and trust across NPU-G",
    highlightLabel: "Safer Streets",
    highlightTitle:
      "Neighbors organizing for visibility, accountability, and care",
    highlightHref: "#events",
  },
  {
    id: "cleanup",
    label: "Cleanup & Beautification",
    summary: "Corridor cleanups and pride-in-place projects",
    highlightLabel: "Hands On",
    highlightTitle:
      "Volunteers showing up for the blocks we call home",
    highlightHref: "#events",
  },
  {
    id: "housing",
    label: "Housing",
    summary: "Stability, affordability, and roots that last",
    highlightLabel: "Homes First",
    highlightTitle:
      "Planning that puts people and place before speculation",
    highlightHref: "#about",
  },
  {
    id: "mobility",
    label: "Transportation",
    summary: "Walkable, bikeable, transit-ready Westside streets",
    highlightLabel: "Move Freely",
    highlightTitle:
      "Sidewalks, crossings, and safer daily trips for every generation",
    highlightHref: "#neighborhoods",
  },
  {
    id: "civic",
    label: "Civic Engagement",
    summary: "Monthly meetings and a clear path to be heard",
    highlightLabel: "Your Seat",
    highlightTitle:
      "Thirteen neighborhoods speaking with one coordinated voice",
    highlightHref: "#contact",
    learnMoreHref: "#npu-at-a-glance",
  },
] as const;

/** City of Atlanta NPU Division resources for NPU-G residents. */
export const cityNpuResources = [
  {
    id: "monthly-meetings",
    label: "Monthly Meetings",
    title: "Third Thursday · 7:00–9:00 PM",
    text: "Join NPU-G’s monthly meeting to review zoning, licenses, and planning items that shape the Westside. Confirm the venue and agenda on the City directory before you go.",
    href: "https://www.atlantaga.gov/government/departments/city-planning/neighborhood-planning-units/neighborhood-and-npu-contacts",
    cta: "NPU Directory & More info",
  },
  {
    id: "virtual-meeting",
    label: "NPU-G Virtual Meeting Access",
    title: "Attend remote meetings via Zoom here.",
    text: "Meeting ID 935 8093 0222. Dial-In 646-558-8656. Access Code 935 8093 0222#.",
    lines: [
      { label: "Meeting ID", value: "935 8093 0222." },
      {
        label: "Dial-In",
        value: "646-558-8656.",
        href: "tel:+16465588656",
      },
      { label: "Access Code", value: "935 8093 0222#." },
    ],
    href: "https://zoom.us/j/93580930222",
    cta: "Join on Zoom",
    zoom: true,
  },
  {
    id: "find-npu",
    label: "Find Your NPU",
    title: "Confirm you are in NPU-G",
    text: "Enter your address in Atlanta’s property information tool to see your Neighborhood Planning Unit, council district, and related planning details.",
    href: "https://gis.atlantaga.gov/propinfo/",
    cta: "Look up address",
  },
  {
    id: "present",
    label: "Present at NPU",
    title: "Bring an item to the table",
    text: "Applicants and neighbors can present rezoning, variance, and license matters at NPU meetings. Please note that NPUs require 30-day notice to process all presentation requests.",
    href: "https://www.atlantaga.gov/government/departments/city-planning/neighborhood-planning-units/npu-presentation-request",
    cta: "Request to present",
  },
  {
    id: "npu-university",
    label: "NPU University",
    title: "Learn the process",
    text: "Training that helps residents navigate land use, zoning, and how community recommendations move from the NPU to City Council and the Mayor.",
    href: "https://www.npuatlanta.org/",
    cta: "Explore training",
  },
  {
    id: "city-planning",
    label: "City Planning Desk",
    title: "Office of Zoning & Development",
    text: "55 Trinity Avenue SW, Atlanta, GA 30303 · 404.330.6145. For directory questions, the City lists dvasquez@atlantaga.gov as a planning contact.",
    href: "https://www.atlantaga.gov/government/departments/city-planning",
    cta: "City Planning",
  },
] as const;

export const leadershipBoard = [
  {
    name: "Torrey Sumlin",
    role: "Chairperson",
    email: "chair@npugatlanta.org",
    image: null,
  },
  {
    name: "Charles Bourgeois Sr.",
    role: "1st Vice-Chairperson",
    email: "1stchair@npugatlanta.org",
    image: "/media/leader-charles.png",
  },
  {
    name: "Darvin Thurman",
    role: "2nd Vice-Chairperson",
    email: "2ndchair@npugatlanta.org",
    image: "/media/leader-darvin.png",
  },
  {
    name: "LA Williams",
    role: "Secretary",
    email: "Secretary@npugatlanta.org",
    image: null,
  },
  {
    name: "Nio Olutosin",
    role: "Asst. Secretary",
    email: "asstsec@npugatlanta.org",
    image: "/media/leader-nio.png",
  },
  {
    name: "Joanna Powell",
    role: "CIG Project Manager",
    email: "cigproman@npugatlanta.org",
    image: "/media/leader-joanna-v3.png",
  },
] as const;

/** Official NPU-G neighborhoods (alphabetical), with association/HOA links when available. */
export const neighborhoods = [
  {
    name: "Almond Park",
    association: "Almond Park + Carey Park Neighborhood Association",
    href: "https://www.apcpatlanta.com/",
  },
  {
    name: "Atlanta Industrial Park",
    association: null,
    href: null,
  },
  {
    name: "Bolton Hills",
    association: "Bolton Hills Civic Association",
    href: "http://www.neighborhoodlink.com/Bolton_Hills",
  },
  {
    name: "Brookview Heights",
    association: null,
    href: null,
  },
  {
    name: "Carey Park",
    association: "Almond Park + Carey Park Neighborhood Association",
    href: "https://www.apcpatlanta.com/",
  },
  {
    name: "Carver Hills",
    association: "Carver Hills Community Association",
    href: "http://www.neighborhoodlink.com/Carver_Hills",
  },
  {
    name: "Chattahoochee",
    association: null,
    href: null,
  },
  {
    name: "English Park",
    association: null,
    href: null,
  },
  {
    name: "Lincoln Homes",
    association: null,
    href: null,
  },
  {
    name: "Monroe Heights",
    association: "Monroe Heights Community Association",
    href: "http://www.neighborhoodlink.com/Monroe_Heights",
  },
  {
    name: "Rockdale",
    association: null,
    href: null,
  },
  {
    name: "Scotts Crossing",
    association: null,
    href: null,
  },
  {
    name: "West Highlands",
    association: "West Highlands HOA",
    href: "https://www.westhighlandsatl.com/",
  },
] as const;

export const newsItems = [
  {
    category: "City Planning",
    title: "Stay connected with NPU resources",
    summary:
      "The City of Atlanta NPU Division publishes dashboards, best practices, and planning initiatives so neighbors can track land-use and zoning matters across the city.",
    href: "https://www.npuatlanta.org/",
    image: "/media/community-openhand.jpg",
  },
  {
    category: "Anniversary",
    title: "NPU system marks 50 years of civic voice",
    summary:
      "Atlanta’s Neighborhood Planning Unit system was established in 1974 under Mayor Maynard Jackson to put residents at the table on planning decisions that shape daily life.",
    href: "https://www.npuatlanta.org/",
    image: "/media/group-npu-signs.jpg",
  },
] as const;

/** Neighborhood choices for newsletter signup (plus outside-NPU-G option). */
export const newsletterNeighborhoods = [
  ...neighborhoods.map((n) => n.name),
  "I live outside of NPU-G",
] as const;

export const upcomingMeeting = {
  type: "Upcoming Event",
  title: "Join Us, RSVP Now",
  eventTitle: "EVENT TITLE",
  date: "DATE",
  time: "TIME",
  location: "LOCATION",
  image: "/media/meeting-clap.jpg",
  rsvpHref: "#contact",
} as const;

export const zoomMeeting = {
  title: "NPU-G Monthly Meeting (Zoom)",
  time: "7:00 PM – 9:00 PM",
  meetingId: "935 8093 0222",
  dialIn: "646-558-8656",
  accessCode: "935 8093 0222#",
  href: "https://zoom.us/j/93580930222",
} as const;

export const meetingAgenda = meetingAgendaData;

export const aboutPoints = [
  {
    title: "What an NPU does",
    text: "Each month, NPUs review rezoning and variance requests, liquor licenses, festivals and parades, fee changes, Comprehensive Development Plan updates, and zoning ordinance amendments, then send a formal community recommendation to the city.",
  },
  {
    title: "Built into the city charter",
    text: "Atlanta’s NPU system was created in 1974 so historically disenfranchised residents would have a durable seat in planning. This lives in the City Charter and cannot be casually removed.",
  },
] as const;
