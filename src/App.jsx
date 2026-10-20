import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { config } from './config'
import * as c from './content'
import Contact from './components/Contact'

const Scene = lazy(() => import('./components/Scene'))
gsap.registerPlugin(ScrollTrigger)

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Splits text into words that slide up from behind a mask
const Words = ({ text, className = '' }) => (
  <span className={className}>
    {text.split(' ').map((w, i) => (
      <span key={i}>
        <span className="w">
          <span className="wi">{w}</span>
        </span>{' '}
      </span>
    ))}
  </span>
)

const Title = ({ children }) => <h2 className="sec-title">{children}</h2>

export default function App() {
  const progress = useRef(0)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    // spotlight glow follows the pointer on cards
    const onMove = (e) => {
      const el = e.target.closest?.('.spot')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let lenis
    let tick
    let ctx
    let onClick

    if (!reducedMotion) {
      lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (t) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      onClick = (e) => {
        const a = e.target.closest?.('a[href^="#"]')
        if (!a) return
        const target = document.querySelector(a.getAttribute('href'))
        if (!target) return
        e.preventDefault()
        lenis.scrollTo(target, { offset: -70, duration: 1.4 })
      }
      document.addEventListener('click', onClick)

      ctx = gsap.context(() => {
        // hero intro
        gsap.from('.hero .wi', { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.07, delay: 0.15 })
        gsap.from('.hero-fade', { opacity: 0, y: 26, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.7 })

        // scroll progress bar + 3D scene progress
        gsap.to('.progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
        })
        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (s) => (progress.current = s.progress),
        })

        // calm the 3D scene once the hero is behind us so text stays readable
        gsap.to('.scene', {
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'bottom 85%', end: 'bottom 25%', scrub: true },
        })
        gsap.to('.hero-copy', {
          yPercent: -12,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        // section titles: words rise in
        gsap.utils.toArray('.sec-title').forEach((t) => {
          gsap.from(t.querySelectorAll('.wi'), {
            yPercent: 115,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.05,
            scrollTrigger: { trigger: t, start: 'top 88%', once: true },
          })
        })

        // generic reveals
        gsap.utils.toArray('.reveal').forEach((el) => {
          gsap.from(el, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        gsap.utils.toArray('[data-stagger]').forEach((group) => {
          gsap.from(group.children, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          })
        })

        // number counters
        gsap.utils.toArray('[data-count]').forEach((el) => {
          const end = Number(el.dataset.count)
          const o = { v: 0 }
          el.textContent = '0'
          gsap.to(o, {
            v: end,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            onUpdate: () => (el.textContent = Math.round(o.v)),
          })
        })

        // process timeline: line draws with scroll, steps light up
        gsap.fromTo(
          '.tl-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true },
          },
        )
        gsap.utils.toArray('.step').forEach((s) => {
          ScrollTrigger.create({ trigger: s, start: 'top 62%', toggleClass: { targets: s, className: 'on' } })
        })

        // subtle parallax on decorative glows
        gsap.utils.toArray('[data-speed]').forEach((el) => {
          gsap.to(el, {
            y: () => -Number(el.dataset.speed) * 160,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })
    } else {
      document.documentElement.classList.add('reduced')
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      if (onClick) document.removeEventListener('click', onClick)
      ctx?.revert()
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
    }
  }, [])

  const photoSrc = config.photo ? `${import.meta.env.BASE_URL}${config.photo}` : ''

  return (
    <>
      <div className="progress" />
      <Suspense fallback={null}>
        <Scene progress={progress} reduced={reducedMotion} />
      </Suspense>

      <header className={`nav ${scrolled || menu ? 'solid' : ''}`}>
        <div className="container nav-inner">
          <a href="#top" className="logo" onClick={() => setMenu(false)}>
            <span className="logo-mark">GC</span>
            <span className="logo-name">{config.name}</span>
          </a>
          <nav className={`links ${menu ? 'open' : ''}`} aria-label="Main">
            {c.nav.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a className="btn small primary" href="#contact" onClick={() => setMenu(false)}>
              Hire me
            </a>
          </nav>
          <button
            className="burger"
            aria-label="Toggle menu"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="badge hero-fade">
                <span className="pulse" /> Available for freelance projects
              </p>
              <h1>
                <Words text="I design, build" />
                <br />
                <Words text="& ship websites" />
                <br />
                <Words text="end to end." className="grad" />
              </h1>
              <p className="lead hero-fade">
                Hi, I'm {config.name.split(' ')[0]}, a {config.title.toLowerCase()}. You bring the idea; I handle
                the design, code, testing and launch, so you get a fast, dependable website without juggling a
                whole team.
              </p>
              <div className="cta-row hero-fade">
                <a className="btn primary" href="#contact">
                  Start a project
                </a>
                <a className="btn ghost" href="#work">
                  See my work
                </a>
              </div>
              <div className="hero-links hero-fade">
                <a href={`mailto:${config.email}`}>{config.email}</a>
                <span>·</span>
                <a href={`tel:+${config.phoneDigits}`}>{config.phoneDisplay}</a>
              </div>
            </div>
          </div>
          <div className="scroll-cue hero-fade" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...c.marquee, ...c.marquee].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" className="section">
          <div className="glow g1" data-speed="0.6" />
          <div className="container about-grid">
            <div className="photo-wrap reveal">
              <div className="photo spot">
                {photoSrc ? <img src={photoSrc} alt={config.name} /> : <span className="initials">GC</span>}
              </div>
            </div>
            <div>
              <p className="eyebrow reveal">01 — About</p>
              <Title>
                <Words text="Hi, I'm Gaurav." />
              </Title>
              <p className="body reveal">
                I'm a software engineer who loves turning ideas into websites that look sharp, load fast and
                don't fall over. After building apps for a fintech company and automation systems that handle
                real data, I now build websites for people like you: one developer, start to finish.
              </p>
              <p className="body reveal">
                I obsess over the unglamorous parts that make a site trustworthy: testing odd edge cases,
                handling failures gracefully and shipping with automated checks. You get a polished site and the
                peace of mind that it just works.
              </p>
              <p className="chip reveal">Based in India</p>
            </div>
          </div>

          <div className="container">
            <div className="stats" data-stagger>
              {c.stats.map((s) => (
                <div className="stat spot" key={s.label}>
                  <div className="stat-n">
                    <b data-count={s.n}>{s.n}</b>
                    {s.suffix}
                  </div>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section">
          <div className="container">
            <p className="eyebrow reveal">02 — Services</p>
            <Title>
              <Words text="Everything your website needs, in one place." />
            </Title>
            <div className="cards" data-stagger>
              {c.services.map((s, i) => (
                <article className="card spot" key={s.title}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="section">
          <div className="glow g2" data-speed="0.8" />
          <div className="container narrow">
            <p className="eyebrow reveal">03 — Process</p>
            <Title>
              <Words text="From first chat to live website." />
            </Title>
            <div className="timeline">
              <div className="tl-line">
                <div className="tl-fill" />
              </div>
              {c.process.map((p, i) => (
                <div className="step" key={p.title}>
                  <span className="dot">{i + 1}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="section">
          <div className="container">
            <p className="eyebrow reveal">04 — Selected work</p>
            <Title>
              <Words text="Things I've built." />
            </Title>
            <div className="projects" data-stagger>
              {c.projects.map((p) => (
                <article className="project spot" key={p.title}>
                  <p className="kind">{p.kind}</p>
                  <h3>{p.title}</h3>
                  <p className="body">{p.text}</p>
                  <ul>
                    {p.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WHY + SKILLS */}
        <section className="section">
          <div className="container">
            <p className="eyebrow reveal">05 — Why work with me</p>
            <Title>
              <Words text="Built to be dependable." />
            </Title>
            <div className="cards four" data-stagger>
              {c.why.map((w) => (
                <article className="card spot" key={w.title}>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </article>
              ))}
            </div>

            <h3 className="sub reveal">Toolbox</h3>
            <div className="skills" data-stagger>
              {c.skills.map((g) => (
                <div className="skill-group" key={g.group}>
                  <p className="kind">{g.group}</p>
                  <div className="tags">
                    {g.items.map((i) => (
                      <span key={i}>{i}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BACKGROUND */}
        <section className="section">
          <div className="container">
            <p className="eyebrow reveal">06 — Background</p>
            <Title>
              <Words text="Where I'm coming from." />
            </Title>
            <div className="bg-grid" data-stagger>
              {c.background.map((b) => (
                <div className="bg-col spot" key={b.heading}>
                  <p className="kind">{b.heading}</p>
                  {b.rows.map((r) => (
                    <div className="bg-row" key={r[0]}>
                      <strong>{r[0]}</strong>
                      <span>{r[1]}</span>
                      {r[2] && <em>{r[2]}</em>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="container narrow">
            <p className="eyebrow reveal">07 — FAQ</p>
            <Title>
              <Words text="Good questions." />
            </Title>
            <div className="faq" data-stagger>
              {c.faq.map((f, i) => (
                <div className={`faq-item ${open === i ? 'open' : ''}`} key={f.q}>
                  <button
                    aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    {f.q}
                    <span className="plus" />
                  </button>
                  <div className="faq-a">
                    <p>{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section contact">
          <div className="glow g3" data-speed="0.5" />
          <div className="container">
            <p className="eyebrow reveal">08 — Contact</p>
            <Title>
              <Words text="Let's build your website." />
            </Title>
            <p className="body reveal contact-lead">
              Tell me about your idea and I'll get back to you with next steps. Prefer to talk? Call, WhatsApp or
              email me directly.
            </p>
            <Contact />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container foot">
          <p>
            © {new Date().getFullYear()} {config.name}. Built with React, GSAP &amp; Three.js.
          </p>
          <div>
            <a href={`mailto:${config.email}`}>Email</a>
            <a href={config.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={config.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
