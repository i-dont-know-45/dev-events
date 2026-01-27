export type EventItem = {
  title: string;
  location: string;
  date: string;
  time: string;
  image: string;
  slug: string;
};

export const events: EventItem[] = [
  {
    title: "Future Tech Expo 2024",
    location: "Tokyo, Japan",
    date: "2024-11-12",
    time: "11:00 AM",
    image: "/images/event1.png",
    slug: "future-tech-expo-2024",
  },
  {
    title: "Creative Design Festival",
    location: "Paris, France",
    date: "2024-10-08",
    time: "02:30 PM",
    image: "/images/event2.png",
    slug: "creative-design-festival",
  },
  {
    title: "Innovation Startup Pitch",
    location: "Berlin, Germany",
    date: "2024-12-15",
    time: "04:00 PM",
    image: "/images/event3.png",
    slug: "innovation-startup-pitch",
  },
  {
    title: "Digital Marketing Summit",
    location: "Sydney, Australia",
    date: "2024-09-22",
    time: "09:30 AM",
    image: "/images/event4.png",
    slug: "digital-marketing-summit",
  },
  {
    title: "Cybersecurity Conference",
    location: "Toronto, Canada",
    date: "2024-08-30",
    time: "03:15 PM",
    image: "/images/event5.png",
    slug: "cybersecurity-conference",
  },
  {
    title: "Product Management Workshop",
    location: "Barcelona, Spain",
    date: "2024-11-25",
    time: "10:45 AM",
    image: "/images/event6.png",
    slug: "product-management-workshop",
  },
];
