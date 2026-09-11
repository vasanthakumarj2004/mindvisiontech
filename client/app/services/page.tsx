import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services | MindVisionTech Innovation",
  description: "Explore MindVisionTech's core engineering domains — Full Stack Software Engineering, VLSI design, PCB layout, industrial automation, embedded systems, and corporate training.",
};

const serviceDetails = [
  {
    slug: "python-full-stack",
    title: "Python Full Stack Development",
    tag: "Software Course",
    icon: "🐍",
    summary: "Develop scalable web applications with Python, Django, MVT architecture, REST APIs, and modern frontend tools.",
    description: "Our Python Full Stack program provides end-to-end training in software engineering. Learn Python fundamentals, object-oriented design, Django web framework, MVT model architecture, RESTful Web APIs, and database management.",
    highlights: [
      "Core Python programming, OOPs principles, & Data Structures",
      "Django Web Framework & MVT (Model-View-Template) architecture",
      "Building & consuming RESTful APIs with Django REST Framework",
      "Database integration with PostgreSQL/MySQL & Web Technologies",
    ],
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "java-full-stack-developer",
    title: "Java Full Stack Developer",
    tag: "Software Course",
    icon: "☕",
    summary: "Build robust enterprise applications using Core Java, J2EE, Spring Framework, Spring Boot, and microservices.",
    description: "Prepare for enterprise software development roles with comprehensive training in Java technologies. Master Core Java, J2EE server components, Spring Boot microservice architectures, Hibernate ORM, and full-stack web development.",
    highlights: [
      "Core Java (J2SE), Multithreading, & Collections Framework",
      "J2EE Servlets, JSP, & Enterprise Web Application patterns",
      "Spring Framework & Spring Boot microservices architecture",
      "Web Technologies, RESTful APIs, & database connectivity",
    ],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "net-full-stack",
    title: ".NET Full Stack Engineering",
    tag: "Software Course",
    icon: "🔷",
    summary: "Master Microsoft enterprise stack with C#.NET, ASP.NET Core, ADO.NET, MVC architecture, and SQL databases.",
    description: "Gain expertise in the Microsoft enterprise software ecosystem. Build high-performance web applications using C# programming, ASP.NET Core, MVC architecture, ADO.NET database connectivity, and SQL Server.",
    highlights: [
      "C#.NET programming & Object-Oriented Application Design",
      "ASP.NET Core & MVC (Model-View-Controller) architecture",
      "ADO.NET, Entity Framework, & SQL Server database operations",
      "Building secure REST APIs & modern web user interfaces",
    ],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "embedded-systems",
    title: "Embedded Systems Development",
    tag: "Core Specialty",
    icon: "🔌",
    summary: "Firmware, microcontrollers, real-time operating systems (RTOS), and hardware interface engineering.",
    description: "Our embedded systems track takes you from simple C programming on 8-bit AVR microcontrollers to architecting multi-threaded FreeRTOS applications on ARM Cortex-M4 and Cortex-M7 platforms.",
    highlights: [
      "Bare-metal driver development (GPIO, UART, SPI, I2C, CAN)",
      "FreeRTOS multitasking, queues, semaphores, and memory management",
      "Embedded Linux kernel cross-compilation & Yocto project",
      "Hands-on hardware labs with STM32, ESP32, and Raspberry Pi Pico",
    ],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "vlsi-design",
    title: "VLSI & Digital Chip Design",
    tag: "High Demand",
    icon: "💎",
    summary: "RTL design, SystemVerilog verification, ASIC flow, and FPGA prototyping.",
    description: "Learn the full digital front-end design pipeline used by top semiconductor MNCs — from writing clean synthesizable Verilog code to UVM-based testbench verification.",
    highlights: [
      "Verilog & SystemVerilog for digital circuit synthesis",
      "UVM (Universal Verification Methodology) framework",
      "Xilinx Vivado & ModelSim lab setups",
      "Static timing analysis (STA) and setup/hold violation fixes",
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "pcb-design",
    title: "PCB Design & Fabrication",
    tag: "Hands-On",
    icon: "📐",
    summary: "Schematics, multi-layer PCB layout, signal integrity, and manufacturing handoff.",
    description: "Design production-ready circuit boards from scratch using KiCad and Altium Designer. Understand high-speed routing, impedance matching, and DFM (Design for Manufacturing).",
    highlights: [
      "Schematic capture and footprint library management",
      "2-layer to 6-layer high-speed PCB routing guidelines",
      "Ground plane separation, EMI reduction, and thermal relief",
      "Gerber generation and ordering physical boards from fabs",
    ],
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "industrial-automation",
    title: "Industrial Automation & Robotics",
    tag: "Industry 4.0",
    icon: "🤖",
    summary: "PLC programming, SCADA systems, industrial IoT, and ROS2 robotics.",
    description: "Master factory automation technologies used in modern manufacturing plants, automated warehouse systems, and process control facilities.",
    highlights: [
      "Siemens S7-1200 & Allen Bradley PLC Ladder Logic",
      "SCADA HMI dashboard design with WinCC",
      "Industrial IoT protocols: Modbus TCP, MQTT, OPC-UA",
      "ROS2 (Robot Operating System) navigation & Gazebo simulation",
    ],
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "edge-ai",
    title: "Edge AI & Machine Vision",
    tag: "Trending",
    icon: "🧠",
    summary: "TensorFlow Lite for Microcontrollers, OpenCV, and edge inference deployment.",
    description: "Deploy deep learning models directly onto resource-constrained edge hardware like NVIDIA Jetson, Raspberry Pi 5, and ESP32-S3 camera modules.",
    highlights: [
      "OpenCV real-time object tracking and image processing",
      "TensorFlow Lite model quantization (FP32 to INT8)",
      "Keyword spotting and gesture recognition on Cortex-M",
      "NVIDIA Jetson Nano CUDA-accelerated vision pipelines",
    ],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "corporate-training",
    title: "Corporate Upskilling & B2B Solutions",
    tag: "For Enterprise",
    icon: "🏢",
    summary: "Customized technical bootcamps for engineering teams and R&D organizations.",
    description: "We partner with semiconductor firms, automotive OEMs, and defense contractors to deliver targeted technical training tailored to company tech stacks.",
    highlights: [
      "Custom curriculum tailored to client hardware platforms",
      "On-premise lab setup or remote virtual lab environments",
      "Pre and post-training competency assessments",
      "Dedicated corporate mentorship and project reviews",
    ],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ServicesPage() {
  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Our Offerings"
        heading="Engineering capabilities that scale."
        subheading="From fundamental embedded C to multi-layer PCB design and edge AI — explore the domains we master and teach."
      />

      {/* ── SERVICES LIST — alternating section backgrounds ───────────── */}
      {serviceDetails.map((service, index) => {
        const isWash = index % 2 === 1;
        return (
          <section
            key={service.slug}
            id={service.slug}
            className={`py-12 sm:py-20 ${isWash ? "bg-brand-blue-wash" : "bg-white"}`}
          >
            <div className="shell grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue-wash px-3.5 py-1 text-xs font-bold text-brand-blue">
                  <span>{service.icon}</span>
                  <span>{service.tag}</span>
                </div>
                <h2 className="mb-3 sm:mb-4 text-2xl font-black text-brand-navy sm:text-3xl lg:text-4xl">
                  {service.title}
                </h2>
                <p className="mb-4 sm:mb-6 text-base sm:text-lg font-medium leading-relaxed text-brand-navy/80">
                  {service.summary}
                </p>
                <p className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-brand-navy/70">
                  {service.description}
                </p>

                {/* Bullet highlights */}
                <ul className="mb-6 sm:mb-8 space-y-2.5 sm:space-y-3">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-brand-navy/85">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white text-[10px]">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="button button--dark inline-flex"
                >
                  Enquire about this programme ↗
                </Link>
              </div>

              {/* Image card */}
              <div className={`overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-blue/15 shadow-blue-xl ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <Image
                  src={service.image}
                  alt={service.title}
                  width={800}
                  height={500}
                  className="h-56 xs:h-64 sm:h-[400px] w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </section>
        );
      })}

      {/* ── CTA BAND — blue-deep ──────────────────────────────────────── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      >
        <div className="shell">
          <p className="eyebrow" style={{ color: "#ef7e20", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Custom requirements?
          </p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, lineHeight: 1.1, margin: "12px 0 0" }}>
            Need a tailored<br /><em style={{ color: "#ef7e20", fontStyle: "normal" }}>training module?</em>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.85)" }}>
            We design custom syllabus tracks for colleges, corporate teams, and government institutions.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/contact" className="button button--accent">Contact our academic team ↗</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
