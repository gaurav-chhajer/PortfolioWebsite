import { useState } from 'react'
import { config } from '../config'

const projectTypes = [
  'Business / portfolio website',
  'Landing page',
  'Web app or dashboard',
  'Adding AI features',
  'Something else',
]

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (data.botcheck) return // spam trap

    const keyMissing = !config.web3formsKey || config.web3formsKey.startsWith('YOUR_')
    if (keyMissing) {
      // Fallback until a form key is added: open the visitor's email app, pre-filled
      const body = `Name: ${data.name}\nEmail: ${data.email}\nProject type: ${data.type}\n\n${data.message}`
      window.location.href = `mailto:${config.email}?subject=${encodeURIComponent(
        'Project enquiry from ' + data.name,
      )}&body=${encodeURIComponent(body)}`
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: config.web3formsKey,
          subject: `New project enquiry from ${data.name}`,
          from_name: 'Portfolio website',
          name: data.name,
          email: data.email,
          project_type: data.type,
          message: data.message,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-grid">
      <div className="contact-info" data-stagger>
        <a className="contact-card spot" href={`mailto:${config.email}`}>
          <span className="label">Email</span>
          <span className="value">{config.email}</span>
        </a>
        <a className="contact-card spot" href={`tel:+${config.phoneDigits}`}>
          <span className="label">Phone</span>
          <span className="value">{config.phoneDisplay}</span>
        </a>
        <a
          className="contact-card spot"
          href={`https://wa.me/${config.phoneDigits}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="label">WhatsApp</span>
          <span className="value">Message me directly</span>
        </a>
        <a className="contact-card spot" href={config.linkedin} target="_blank" rel="noreferrer">
          <span className="label">LinkedIn</span>
          <span className="value">gaurav-chhajer</span>
        </a>
        <a className="contact-card spot" href={config.github} target="_blank" rel="noreferrer">
          <span className="label">GitHub</span>
          <span className="value">gaurav-chhajer</span>
        </a>
      </div>

      <form className="form reveal" onSubmit={onSubmit}>
        <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" />
        <div className="row">
          <label>
            Your name
            <input name="name" type="text" required autoComplete="name" placeholder="Jane Doe" />
          </label>
          <label>
            Your email
            <input name="email" type="email" required autoComplete="email" placeholder="jane@company.com" />
          </label>
        </div>
        <label>
          What do you need?
          <select name="type" defaultValue={projectTypes[0]}>
            {projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Tell me about your project
          <textarea
            name="message"
            rows="5"
            required
            placeholder="What is it for, who is it for, and when would you like it live?"
          />
        </label>
        <button className="btn primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className={`form-msg ${status}`} role="status" aria-live="polite">
          {status === 'success' && "Thanks! Your message is on its way. I'll reply soon."}
          {status === 'error' &&
            `Something went wrong. Please email me directly at ${config.email}.`}
        </p>
      </form>
    </div>
  )
}
