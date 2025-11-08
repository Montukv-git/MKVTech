
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function useKey(k: string, handler: () => void) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const key = (e.key || (e as any).code || "").toLowerCase();
      if (key === k.toLowerCase()) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [k, handler]);
}

function Magnetic({ children, strength = 0.25, className = "" }: {children: React.ReactNode, strength?: number, className?: string}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("none");
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        setTransform(`translate(${x}px, ${y}px)`);
      }}
      onMouseLeave={() => setTransform("none")}
      className={className}
      style={{ transform }}
    >
      {children}
    </div>
  );
}

function TiltCard({ children }: {children: React.ReactNode}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = (-py * 8).toFixed(2);
        const ry = (px * 10).toFixed(2);
        setStyle({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)` });
      }}
      onMouseLeave={() => setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" })}
      className="will-change-transform"
      style={style}
    >
      {children}
    </div>
  );
}

function CursorDot() {
  const dot = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", move);
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.15; y += (ty - y) * 0.15;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); };
  }, []);
  return <div ref={dot} className="fixed left-0 top-0 z-50 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 mix-blend-difference pointer-events-none"/>;
}

function CommandPalette({ open, onClose, links }: {open: boolean, onClose: () => void, links: {label: string, href: string, target?: string}[]}) {
  useKey("Escape", () => open && onClose());
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-28 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="text-sm text-neutral-400 mb-3">Quick actions (press <kbd className='px-1 py-0.5 rounded bg-neutral-800'>K</kbd> to toggle)</div>
            <ul className="divide-y divide-neutral-800">
              {links.map((l, i) => (
                <li key={i} className="py-3">
                  <a className="flex items-center justify-between hover:text-white" href={l.href} target={l.target || undefined}>
                    <span>{l.label}</span>
                    <span className="text-xs text-neutral-500">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TestimonialCarousel({ items }: {items: {quote: string, name: string, role: string}[]}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-lg">“{items[i].quote}”</p>
          <div className="mt-4 text-sm text-neutral-400">— {items[i].name}, {items[i].role}</div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex gap-2">
        {items.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} className={`h-2 w-2 rounded-full ${i===idx?"bg-white":"bg-neutral-600"}`} aria-label={`Go to testimonial ${idx+1}`}></button>
        ))}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useKey("k", () => setPaletteOpen((v) => !v));

  const socials = {
    github: "https://github.com/Montukv-git",
    linkedin: "https://www.linkedin.com/in/montukeshwar-vaishnaw-199054164/",
    youtube: "https://www.youtube.com/@Montukv",
    email: "mailto:Montukeshwar20@gmail.com?subject=Hi%20Montukeshwar!",
    whatsapp: "https://wa.me/918964879725",
    resume: "resume.pdf", // relative so it works on GitHub Pages base
    phone: "tel:+918964879725",
  };

  const quickLinks = [
    { label: "Email Montukeshwar", href: socials.email },
    { label: "LinkedIn", href: socials.linkedin, target: "_blank" },
    { label: "GitHub", href: socials.github, target: "_blank" },
    { label: "YouTube", href: socials.youtube, target: "_blank" },
    { label: "Go to Work", href: "#work" },
    { label: "Download Résumé", href: socials.resume },
  ];

  const projects = [
    {
      title: "Finler AI",
      description: "A website that help you achive your financial goals by providing AI analysis over your budgeting and suggest invements to achive your goals",
      image: "https://i.postimg.cc/Tw2j2RnD/finler-banner.png",
      link: "https://example.com/project-automator",
      tags: ["LLM", "FastAPI", "Typescript"],
    },
    {
      title: "AI Assistant",
      description: "A developer-first chat assistant that deploys, monitors, and rolls back services from chat.",
      image: "https://i.postimg.cc/Zn7wzWgY/brain-AI.png",
      link: "https://example.com/project-chatops",
      tags: ["Python", "AI/ML", "Redis"],
    },
    {
      title: "CardSmith",
      description: "A Flashcard generation app with active-learning loops to speed up dataset creation.",
      image: "https://i.postimg.cc/6psd2VCP/Chat-GPT-Image-Nov-6-2025-11-06-35-PM.png",
      link: "https://example.com/vision-label-studio",
      tags: ["Python", "FastAPI", "PostgreSQL"],
    },
  ];

  const services = [
    { title: "MVP in 30 Days", blurb: "Design, build, and ship a polished MVP fast — from idea to deploy with analytics and docs." },
    { title: "AI Integrations", blurb: "Embed LLMs into your product: RAG, agents, evaluation, and cost/perf tuning for production." },
    { title: "Automation & Ops", blurb: "CI/CD, cloud infra, and internal tools to automate busywork and keep releases smooth." },
  ];

  const experience = [
    {
      role: "Freelance Engineer",
      period: "2024 — Present",
      points: [
        "Designed and deployed custom web applications and APIs for small businesses and startups using Python, JavaScript, and FastAPI.",
        "Integrated third-party APIs and automation tools to streamline client workflows and reduce manual effort.",
        "Delivered end-to-end solutions — from planning and development to deployment and client support — ensuring reliability and performance.",
      ],
    },
    {
      role: "Backend Developer – GCC App & Website",
      period: "2021 — 2023",
      points: [
        "Developed and maintained scalable REST APIs using Ruby on Rails and Python for GCC app and website.",
        "Managed AWS infrastructure (S3, EC2) to ensure high performance, scalability, and reliability.",
        "Optimized PostgreSQL databases for large-scale data handling, scraping, and analytics.",
      ],
    },
  ];

  const skills = [
    "JavaScript/TypeScript",
    "Next.js / React",
    "Node.js / FastAPI",
    "Postgres / Prisma",
    "Auth / RBAC",
    "Testing / CI/CD",
    "LLM / RAG / Agents",
    "System Design",
  ];

  const testimonials = [
    { quote: "Montukeshwar delivered an MVP in 3 weeks that our team actually uses daily.", name: "Aarav S.", role: "Founder, Fintech" },
    { quote: "Super responsive, pragmatic, and obsessed with DX and performance.", name: "Natasha K.", role: "CTO, HealthTech" },
    { quote: "Automations saved us ~25 hours/week across ops — huge impact.", name: "Rohan M.", role: "Ops Lead, D2C" },
  ];

  const faqs = [
    { q: "What’s your typical engagement model?", a: "Project-based MVPs or monthly retainers with a weekly cadence and clear outcomes." },
    { q: "Do you work with existing codebases?", a: "Yes — I enjoy refactors, performance work, and adding new features without breaking things." },
    { q: "How soon can you start?", a: "Usually within 1–2 weeks. For rush projects, I can often create a scoped sprint." },
  ];

  const logos = ["Acme", "Nimbus", "Orbit", "Pulse", "Vertex", "Northstar"];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Smoke tests only in dev
  useEffect(() => {
    if (import.meta.env.MODE === "production") return;
    try {
      console.assert(Array.isArray(projects) && projects.length >= 3, "Projects should contain at least 3 items");
      console.assert(quickLinks.some(l => l.label.includes("Download Résumé")), "QuickLinks should include résumé download");
      console.assert(Object.keys(socials).includes("youtube"), "Socials should include YouTube");
      console.assert(experience[0].points.every(p => typeof p === "string" && !/\r?\n/.test(p)), "Experience bullet points should not contain newlines");
      console.assert(testimonials.length > 0, "Testimonials should not be empty");
      console.assert(skills.length >= 4, "Skills should have at least 4 entries");
      console.assert(projects.every(pr => /^https?:\/\/.*/.test(pr.link)), "Project links should be absolute URLs");
      console.assert(socials.email.startsWith("mailto:"), "Email link should be a mailto:");
      console.assert(document.querySelector('#contact') && document.querySelector('#work'), "Contact and Work sections should exist in DOM");
    } catch (e) {
      console.warn("Smoke tests skipped:", e);
    }
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 scroll-smooth relative">
      <CursorDot />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} links={quickLinks} />

      {/* Background: gradient mesh + grid */}
      <div aria-hidden className="pointer-events-none fixed inset-0 [background:radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,.15),transparent),radial-gradient(800px_500px_at_90%_20%,rgba(236,72,153,.12),transparent),radial-gradient(900px_600px_at_50%_120%,rgba(16,185,129,.10),transparent)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-[.18] [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:24px_24px,24px_24px]" />

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="font-semibold tracking-tight">MV</motion.div>
          <nav className="hidden md:flex gap-6 text-sm">
            {[
              { id: "about", label: "About" },
              { id: "experience", label: "Experience" },
              { id: "work", label: "Work" },
              { id: "services", label: "Services" },
              { id: "contact", label: "Contact" },
            ].map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="hover:text-white text-neutral-300">
                {item.label}
              </button>
            ))}
          </nav>
          <Magnetic>
            <a href={socials.resume} download className="text-sm rounded-xl px-4 py-2 bg-white text-neutral-900 font-medium hover:opacity-90">
              Download Résumé
            </a>
          </Magnetic>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* floating blobs */}
        <motion.div aria-hidden className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-fuchsia-500/20" animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute top-36 -left-24 h-72 w-72 rounded-full blur-3xl bg-sky-500/20" animate={{ y: [0, 18, 0], scale: [1, 1.05, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />

        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-28 flex flex-col items-center text-center">
          <motion.p variants={fadeUp} initial="hidden" animate="show" className="text-xs uppercase tracking-widest text-neutral-400">Hello, I’m</motion.p>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="mt-2 text-4xl sm:text-6xl font-bold tracking-tight">Montukeshwar Vaishnaw</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" className="mt-4 max-w-2xl text-neutral-300">
            Developer — I build and innovate products that turn ideas into real, usable software. I love shipping fast, learning from users, and polishing the details.
          </motion.p>
          <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.button variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => scrollTo("about")} className="rounded-xl px-5 py-3 bg-white text-neutral-900 font-medium shadow-[0_0_0_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_0_6px_rgba(255,255,255,0.08)] transition-shadow">Know more about me</motion.button>
            <motion.a variants={fadeUp} href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }} className="rounded-xl px-5 py-3 border border-neutral-700 hover:border-neutral-500" whileHover={{ y: -1 }} whileTap={{ y: 0 }}>Contact Me</motion.a>
          </motion.div>

          {/* Socials */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-300">
            <motion.a variants={fadeUp} className="hover:text-white" href={socials.github} target="_blank">GitHub</motion.a>
            <motion.a variants={fadeUp} className="hover:text-white" href={socials.linkedin} target="_blank">LinkedIn</motion.a>
            <motion.a variants={fadeUp} className="hover:text-white" href={socials.youtube} target="_blank">YouTube</motion.a>
            <motion.a variants={fadeUp} className="hover:text-white" href={socials.email}>Email</motion.a>
            <motion.a variants={fadeUp} className="hover:text-white" href={socials.whatsapp} target="_blank">WhatsApp</motion.a>
          </motion.div>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-3 w-full max-w-3xl">
            {[
              { k: "+ projects", v: 18 },
              { k: "yrs building", v: 5 },
              { k: "avg. response", v: "<24h" },
            ].map((s, idx) => (
              <div key={idx} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 text-center">
                <div className="text-2xl font-semibold">{s.v}</div>
                <div className="text-xs text-neutral-400 mt-1">{s.k}</div>
              </div>
            ))}
          </div>

          {/* marquee badges */}
          <div className="mt-12 relative w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none"/>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none"/>
            <motion.div initial={{ x: 0 }} animate={{ x: [0, -800] }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }} className="flex gap-3 whitespace-nowrap">
              {["Full‑stack", "AI/RAG", "Automation", "Next.js", "FastAPI", "Design Systems", "Perf", "Accessibility"].map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs">{b}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20 border-t border-neutral-900/60">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-semibold">About Me</motion.h2>
        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-4 max-w-3xl text-neutral-300">I’m a product-minded developer focused on building reliable, delightful software. My work spans full‑stack web, AI integrations, and automation. I enjoy owning problems end‑to‑end: from figuring out the real user need to shipping a maintainable solution.</motion.p>

        {/* Skills grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {skills.map((s, i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-200">{s}</div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="mx-auto max-w-6xl px-4 py-20 border-t border-neutral-900/60">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-semibold">My Experience</motion.h2>
        <div className="mt-8 grid gap-6">
          {experience.map((job, i) => (
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} key={i} className="rounded-2xl border border-neutral-800 p-6 bg-neutral-900/30 hover:bg-neutral-900/50 transition shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-lg font-medium">{job.role}</h3>
                <span className="text-sm text-neutral-400">{job.period}</span>
              </div>
              <ul className="mt-4 list-disc pl-5 text-neutral-300 space-y-2">
                {job.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Logos strip */}
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="text-xs uppercase tracking-wide text-neutral-400 mb-4">Trusted by teams at</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {logos.map((name, i) => (
              <div key={i} className="h-10 rounded-lg border border-neutral-800 bg-neutral-950/60 flex items-center justify-center text-neutral-400 text-sm">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="mx-auto max-w-6xl px-4 py-20 border-t border-neutral-900/60">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-semibold">My Work</motion.h2>
        <p className="mt-2 text-neutral-400">A few past projects. Click to open.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <TiltCard key={i}>
              <motion.a variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} href={p.link} target="_blank" className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 transition relative block">
                <div className="aspect-[16/10] bg-neutral-800/50 relative">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="mt-2 text-sm text-neutral-300">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t, j) => (
                      <span key={j} className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-200">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.a>
            </TiltCard>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-12">
          <TestimonialCarousel items={testimonials} />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-20 border-t border-neutral-900/60">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-semibold">Services</motion.h2>
        <p className="mt-2 text-neutral-400">Available for freelance client work.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="rounded-2xl border border-neutral-800 p-6 bg-neutral-900/30 hover:bg-neutral-900/50 transition shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" whileHover={{ scale: 1.02 }}>
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-2 text-neutral-300">{s.blurb}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
              <summary className="cursor-pointer select-none font-medium">{f.q}</summary>
              <p className="mt-2 text-neutral-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Pre-contact CTA banner */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/60 to-neutral-900/20 p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold">Have an idea you want to ship?</h3>
          <p className="mt-2 text-neutral-300">Let’s scope it in 30 minutes. No strings attached.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="#contact" onClick={(e)=>{e.preventDefault();document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}} className="rounded-xl px-5 py-3 bg-white text-neutral-900 font-medium">Book an intro</a>
            <a href={socials.resume} download className="rounded-xl px-5 py-3 border border-neutral-700 hover:border-neutral-500">Download résumé</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-20 border-t border-neutral-900/60">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-semibold">Contact Me</motion.h2>
        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-2 text-neutral-300 max-w-2xl">Have a project in mind, or want to collaborate? I’d love to hear from you.</motion.p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <motion.form variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} onSubmit={(e) => { e.preventDefault(); window.location.href = socials.email; }} className="rounded-2xl border border-neutral-800 p-6 bg-neutral-900/30">
            <label className="block text-sm">Name</label>
            <input className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600" placeholder="Your name" />
            <label className="block text-sm mt-4">Email</label>
            <input type="email" className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600" placeholder="you@example.com" />
            <label className="block text-sm mt-4">Message</label>
            <textarea rows={5} className="mt-1 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600" placeholder="Tell me about your project…"></textarea>
            <button type="submit" className="mt-4 rounded-xl px-5 py-3 bg-white text-neutral-900 font-medium">Send Message</button>
          </motion.form>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl border border-neutral-800 p-6 bg-neutral-900/30">
            <h3 className="font-medium">Prefer quick chat?</h3>
            <p className="mt-2 text-neutral-300">Reach me on any of these:</p>
            <ul className="mt-4 space-y-2 text-neutral-300">
              <li><a className="hover:text-white" href={socials.email}>Email</a></li>
              <li><a className="hover:text-white" href={socials.phone}>Call</a></li>
              <li><a className="hover:text-white" href={socials.whatsapp} target="_blank">WhatsApp</a></li>
              <li><a className="hover:text-white" href={socials.github} target="_blank">GitHub</a></li>
              <li><a className="hover:text-white" href={socials.youtube} target="_blank">YouTube</a></li>
            </ul>
            <a href={socials.resume} download className="mt-6 inline-block rounded-xl px-5 py-3 border border-neutral-700 hover:border-neutral-500">Download Résumé (PDF)</a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900/60 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MKVtech.pvt.lt. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="hover:text-neutral-300" href="#about" onClick={(e)=>{e.preventDefault();document.getElementById('about')?.scrollIntoView({behavior:'smooth'})}}>About</a>
            <a className="hover:text-neutral-300" href="#work" onClick={(e)=>{e.preventDefault();document.getElementById('work')?.scrollIntoView({behavior:'smooth'})}}>Work</a>
            <a className="hover:text-neutral-300" href="#contact" onClick={(e)=>{e.preventDefault();document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}}>Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
