export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  authorImg: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "getting-started-with-stm32",
    category: "Embedded Systems",
    title: "Getting Started with STM32: A Practical First Project",
    excerpt: "Skip the theory overload. This guide walks you through blinking an LED, reading a sensor, and sending UART data - all in your first afternoon.",
    author: "Suresh K.",
    authorImg: "/images/authors/suresh-k.jpg",
    date: "Aug 28, 2026",
    readTime: "8 min read",
    imageUrl: "/images/blogs/stm32-getting-started.jpg",
    featured: true,
  },
  {
    slug: "vlsi-interview-prep-2026",
    category: "Career Advice",
    title: "VLSI Interview Questions That Actually Get Asked in 2026",
    excerpt: "We tracked 200+ placement interviews over 6 months and compiled the 30 questions that came up most often - with model answers.",
    author: "Anjali N.",
    authorImg: "/images/authors/anjali-n.jpg",
    date: "Aug 15, 2026",
    readTime: "12 min read",
    imageUrl: "/images/blogs/vlsi-interview-prep.jpg",
  },
  {
    slug: "edge-ai-on-microcontrollers",
    category: "AI & ML",
    title: "Running TensorFlow Lite on a Microcontroller (Without a PhD)",
    excerpt: "Edge AI doesn't have to be intimidating. This step-by-step guide shows you how to deploy a gesture-recognition model on an Arduino Nano 33 BLE.",
    author: "Preethi B.",
    authorImg: "/images/authors/preethi-b.jpg",
    date: "Aug 5, 2026",
    readTime: "10 min read",
    imageUrl: "/images/blogs/edge-ai-microcontrollers.jpg",
  },
  {
    slug: "pcb-design-mistakes",
    category: "PCB Design",
    title: "7 PCB Design Mistakes That Will Fail Your Board at Manufacturing",
    excerpt: "Reviewed by a senior PCB engineer with 15 years of experience - these are the layout errors that cause the most expensive respins.",
    author: "Suresh K.",
    authorImg: "/images/authors/suresh-k.jpg",
    date: "Jul 22, 2026",
    readTime: "6 min read",
    imageUrl: "/images/blogs/pcb-design-mistakes.jpg",
  },
  {
    slug: "industry-4-automation",
    category: "Industry Trends",
    title: "Industry 4.0 Is Already Here - Are You Ready?",
    excerpt: "The factories being built today run on PLC, SCADA, and AI. Here's what engineers need to know to stay relevant in the next decade.",
    author: "Dr. Kiran R.",
    authorImg: "/images/authors/kiran-r.jpg",
    date: "Jul 10, 2026",
    readTime: "9 min read",
    imageUrl: "/images/blogs/industry-4-automation.jpg",
  },
  {
    slug: "robotics-ros2-beginners",
    category: "Embedded Systems",
    title: "ROS2 for Beginners: Build Your First Autonomous Robot",
    excerpt: "ROS2 is the industry standard for robotics development. This beginner-friendly guide gets you from zero to a working differential-drive robot.",
    author: "Anjali N.",
    authorImg: "/images/authors/anjali-n.jpg",
    date: "Jun 30, 2026",
    readTime: "15 min read",
    imageUrl: "/images/blogs/ros2-robotics.jpg",
  },
];

export const blogCategories = ["All", "Embedded Systems", "AI & ML", "PCB Design", "Career Advice", "Industry Trends"];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
