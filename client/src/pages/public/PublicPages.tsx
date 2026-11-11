import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { MentorCard } from '../../components/common/MentorCard.js';
import { Seo } from '../../components/common/Seo.js';
import type { MentorCardData } from '../../types/index.js';

type Mentor = MentorCardData & { experienceYears?: number };
const errorMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
    ?.message || 'Something went wrong';

export function MentorSearch() {
  const [params, setParams] = useSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const q = params.get('q') || '';
  useEffect(() => {
    setLoading(true);
    void api
      .get('/mentors', { params: Object.fromEntries(params) })
      .then(({ data }) => setMentors(data.data))
      .catch((error) => toast.error(errorMessage(error)))
      .finally(() => setLoading(false));
  }, [params]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Seo
        title="Find a mentor"
        description="Browse verified Prepant mentors by subject, experience and price."
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Find your mentor</h1>
          <p className="mt-2 text-slate-600">Choose a mentor who fits your goals and schedule.</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={q}
            placeholder="Search subject or skill"
            onChange={(event) => {
              const next = new URLSearchParams(params);
              if (event.target.value) next.set('q', event.target.value);
              else next.delete('q');
              setParams(next);
            }}
          />
          <select
            className="rounded-[10px] border px-3 text-sm"
            value={params.get('sort') || 'recommended'}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              next.set('sort', event.target.value);
              setParams(next);
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price low to high</option>
            <option value="experience">Most experienced</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="py-16 text-center text-slate-500">Finding mentors…</div>
      ) : mentors.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="font-heading text-xl font-bold">No mentors found</h2>
          <p className="mt-2 text-sm text-slate-600">Try another search or request a mentor.</p>
          <Button className="mt-5" asChild>
            <Link to="/contact">Request a mentor</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.slug} mentor={mentor} />
          ))}
        </div>
      )}
    </main>
  );
}

export function MentorProfilePage({ slug }: { slug: string }) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  useEffect(() => {
    void api
      .get(`/mentors/${slug}`)
      .then(({ data }) => setMentor(data.data))
      .catch(() => setMentor(null));
  }, [slug]);
  if (!mentor)
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-heading text-2xl font-bold">Mentor not found</h1>
        <Link className="mt-4 inline-block text-primary-600" to="/mentors">
          Browse mentors
        </Link>
      </main>
    );
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Seo
        title={mentor.name}
        description={mentor.headline}
        canonical={`${window.location.origin}/mentors/${mentor.slug}`}
      />
      <div className="rounded-card border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-700">
            {mentor.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">{mentor.name}</h1>
            <p className="mt-1 text-slate-600">{mentor.headline}</p>
            <p className="mt-2 text-sm">
              ★ {mentor.ratingAvg.toFixed(1)} · {mentor.ratingCount} reviews ·{' '}
              {mentor.sessionsTaught} sessions
            </p>
          </div>
        </div>
        <p className="mt-8 leading-7 text-slate-700">{mentor.bio}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {mentor.subjects.map((subject) => (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm" key={subject}>
              {subject}
            </span>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-5">
          <p className="font-bold">
            ₹{Math.round(mentor.hourlyRatePaise / 100).toLocaleString('en-IN')} / hour
          </p>
          <Button asChild>
            <Link to={`/book/${mentor.slug}`}>Book a trial</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api.post('/leads', data);
      setSent(true);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <Seo title="Contact Prepant" />
      <h1 className="font-heading text-3xl font-bold">Talk to a counsellor</h1>
      {sent ? (
        <p className="mt-6 rounded-card bg-emerald-50 p-5 text-emerald-800">
          Thanks. We will be in touch soon.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-card border bg-white p-6 shadow-sm"
        >
          <Input name="name" placeholder="Your name" required />
          <Input name="phone" placeholder="Phone number" required />
          <Input name="email" type="email" placeholder="Email (optional)" />
          <Input name="interest" placeholder="What would you like to learn?" required />
          <textarea
            name="message"
            className="min-h-28 w-full rounded-[10px] border p-3 text-sm"
            placeholder="Tell us a little more"
          />
          <input name="source" type="hidden" value="contact" />
          <Button>Send my request</Button>
        </form>
      )}
    </main>
  );
}

export function StaticPage({ title, children }: { title: string; children: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Seo title={title} />
      <h1 className="font-heading text-4xl font-bold">{title}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">{children}</p>
    </main>
  );
}
