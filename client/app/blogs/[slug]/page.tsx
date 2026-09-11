import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { blogPosts, getBlogPost } from "@/lib/blog";

// ── Static article body content (keyed by slug) ──────────────────────────────
const articleContent: Record<string, string[]> = {
  "getting-started-with-stm32": [
    "The STM32 microcontroller series from STMicroelectronics is an industry standard across automotive, industrial automation, and consumer electronics. Yet many beginners get overwhelmed by the vast documentation and HAL library setup.",
    "In this tutorial, we skip unnecessary theory and focus on setting up STM32CubeIDE, configuring clock settings, setting GPIO pins for LED control, and implementing UART communication for sensor data readout.",
    "Step 1: Setting up STM32CubeMX and generating clean C initialization code.",
    "Step 2: Understanding GPIO pin modes — Output Push-Pull vs. Open-Drain.",
    "Step 3: Writing your first non-blocking delay using SysTick or Hardware Timers.",
    "Step 4: Transmitting telemetry over UART to a host PC using serial terminal tools like TeraTerm or PuTTY.",
    "By the end of this afternoon project, you will have a rock-solid foundation for ARM Cortex-M architecture development.",
  ],
  "vlsi-interview-prep-2026": [
    "Semiconductor hiring in India has seen unprecedented growth over the last 18 months, driven by national fab initiatives and global design centers expanding across Bengaluru, Hyderabad, and Pune.",
    "However, interview standards have also evolved. Companies no longer just ask static Verilog syntax — they test setup and hold time violation scenarios, CDC (Clock Domain Crossing) synchronization, and physical design DRC/LVS fundamentals.",
    "Key Topic 1: Setup and Hold Time Analysis under worst-case PVT corners.",
    "Key Topic 2: Metastability and multi-flop synchronizers in asynchronous clock boundaries.",
    "Key Topic 3: Static Timing Analysis (STA) constraint generation using SDC files.",
    "Preparing these concepts with real lab simulation traces gives candidates an immediate edge in technical interview rounds.",
  ],
  "edge-ai-on-microcontrollers": [
    "Microcontrollers with tiny RAM budgets (under 256KB) can now run quantized neural networks for keyword spotting, gesture classification, and predictive maintenance.",
    "Using TensorFlow Lite for Microcontrollers (TFLM), we quantize FP32 models to INT8 weights, reducing model footprint by 75% with minimal accuracy loss.",
    "This practical guide walks through collecting IMU sensor datasets, training a model in Google Colab, converting to C byte array header files, and executing inference loops directly on hardware.",
    "The result is a gesture-recognition demo that runs at 100 inferences per second on an Arduino Nano 33 BLE — no cloud connection required.",
  ],
  "pcb-design-mistakes": [
    "Designing a schematic is only half the battle. When transitioning to 4-layer or 6-layer high-speed PCB layout, signal integrity and manufacturability become critical.",
    "Mistake 1: Fragmented return paths crossing split ground planes cause EMI emissions and signal degradation.",
    "Mistake 2: Missing decoupling capacitor placement close to IC power pins increases switching noise.",
    "Mistake 3: Inadequate thermal relief pads causing cold solder joints during reflow.",
    "Mistake 4: Via-in-pad without proper filling on BGA or QFN components pulls solder away during reflow.",
    "By adhering to strict DFM (Design for Manufacturing) guidelines, engineers avoid costly board respins and delivery delays.",
  ],
  "industry-4-automation": [
    "Modern industrial automation integrates programmable logic controllers (PLCs), industrial IoT sensors, and cloud analytics in ways that were simply impossible a decade ago.",
    "Engineers who understand both operational technology (OT) protocols like Modbus/PROFINET and information technology (IT) systems like MQTT and REST APIs are in highest demand across smart manufacturing plants.",
    "The skill gap is real: companies are actively seeking engineers who can bridge the OT-IT convergence — configuring SCADA dashboards, writing PLC ladder logic, and integrating data pipelines to cloud analytics tools.",
  ],
  "robotics-ros2-beginners": [
    "Robot Operating System 2 (ROS2) provides the middleware framework, message-passing interface, and packages for navigation (Nav2) and perception that power everything from warehouse robots to surgical systems.",
    "In this guide, we configure ROS2 nodes, publishers/subscribers in Python and C++, and simulate robot movement in Gazebo before deploying to physical hardware.",
    "By the end, you will have a working differential-drive robot that maps an environment using lidar and navigates autonomously to goal poses — all running on a Raspberry Pi 4.",
  ],
};

// ── Author role map ───────────────────────────────────────────────────────────
const authorRoles: Record<string, string> = {
  "Suresh K.": "Senior Embedded Hardware Specialist",
  "Anjali N.": "Head of VLSI & Semiconductor Curriculum",
  "Preethi B.": "AI & Edge Computing Specialist",
  "Dr. Kiran R.": "Founder & Technical Director",
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article Not Found | MindVisionTech" };
  return {
    title: `${post.title} | MindVisionTech Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const content = articleContent[post.slug] ?? [post.excerpt];
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const authorRole = authorRoles[post.author] ?? "MindVisionTech Instructor";

  return (
    <main>
      {/* ── ARTICLE HEADER — blue-deep ────────────────────────────────── */}
      <section className="bg-brand-blue-deep py-10 sm:py-16 text-white">
        <div className="shell max-w-4xl mx-auto">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/60 hover:text-white transition-colors mb-6 sm:mb-8"
          >
            ← Back to all articles
          </Link>
          <div>
            <span className="blog-card__tag mb-3 inline-block">{post.category}</span>
          </div>
          <h1 className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-white/60 text-xs sm:text-sm">
            <Image
              src={post.authorImg}
              alt={post.author}
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-white/25"
            />
            <span className="font-semibold text-white/80">{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      {/* ── ARTICLE CONTENT — white background ──────────────────────── */}
      <article className="section shell max-w-4xl mx-auto">
        {/* Featured Image */}
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-blue/15 shadow-blue-lg mb-8 sm:mb-12">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={600}
            className="h-52 xs:h-64 sm:h-[420px] w-full object-cover"
            priority
          />
        </div>

        {/* Author Bio Box */}
        <div className="flex items-center gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-brand-blue/12 bg-brand-blue-wash p-4 sm:p-5 mb-8 sm:mb-12 shadow-blue-sm">
          <Image
            src={post.authorImg}
            alt={post.author}
            width={56}
            height={56}
            className="h-11 w-11 sm:h-14 sm:w-14 rounded-full border-2 border-white shadow-sm shrink-0"
          />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-brand-navy">{post.author}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-brand-navy/60">{authorRole}</p>
          </div>
        </div>

        {/* Article Paragraphs */}
        <div className="space-y-5 sm:space-y-6 text-base sm:text-lg leading-relaxed text-brand-navy/80">
          {content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      {/* ── RELATED ARTICLES — blue-wash background ─────────────────── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20">
        <div className="shell max-w-4xl mx-auto">
          <p className="eyebrow">Keep reading</p>
          <h2 className="mb-6 sm:mb-10">
            Related<br /><em>articles.</em>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blogs/${rel.slug}`}
                className="group rounded-2xl border border-brand-blue/15 bg-white p-5 sm:p-6 shadow-blue-sm transition-all hover:-translate-y-1 hover:shadow-blue-md"
              >
                <span className="blog-card__tag mb-3 inline-block">{rel.category}</span>
                <h3 className="mt-3 mb-2 text-base sm:text-lg font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                  {rel.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-navy/65 line-clamp-2">{rel.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER — blue-deep ──────────────────────────────────── */}
      <section className="bg-brand-blue-deep py-12 sm:py-20 text-center">
        <div className="shell max-w-xl mx-auto">
          <p className="eyebrow" style={{ color: "#ef7e20" }}>Stay informed</p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(26px, 5vw, 48px)" }}>
            Enjoyed this read?<br /><em style={{ color: "#ef7e20" }}>Get weekly updates.</em>
          </h2>
          <BlogNewsletter />
        </div>
      </section>

      <Footer />
    </main>
  );
}
