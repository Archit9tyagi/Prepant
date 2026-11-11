import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { MentorCard } from '../../components/common/MentorCard.js';
import { Seo } from '../../components/common/Seo.js';
import type { MentorCardData } from '../../types/index.js';

type Mentor = MentorCardData & {
  mentorId: string;
  experienceYears?: number;
  subjectIds?: string[];
};
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
  const [saved, setSaved] = useState(false);
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                api
                  .post(`/favorites/${mentor.mentorId}`)
                  .then(() => setSaved(true))
                  .catch(() => toast.error('Sign in to save mentors'))
              }
            >
              {saved ? 'Saved' : 'Save mentor'}
            </Button>
            <Button asChild>
              <Link to={`/book/${mentor.slug}`}>Book a trial</Link>
            </Button>
          </div>
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

export function FindMyMentor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goal: '', level: '', budget: '', time: '' });
  const fields = [
    [
      'goal',
      'What do you want to learn?',
      ['School subjects', 'Competitive exam', 'Professional skill', 'Hobby or language'],
    ],
    [
      'level',
      'What is your current level?',
      ['Beginner', 'Intermediate', 'Advanced', 'Class 6–12'],
    ],
    ['budget', 'Your hourly budget', ['Under ₹500', '₹500–₹1,000', '₹1,000–₹2,000', 'Flexible']],
    ['time', 'When do you prefer to learn?', ['Morning', 'Afternoon', 'Evening', 'Weekends']],
  ] as const;
  const [key, title, options] = fields[step];
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Seo
        title="Find my mentor"
        description="Answer four quick questions and discover mentors who fit your goals."
      />
      <p className="text-sm font-semibold text-primary-700">Step {step + 1} of 4</p>
      <h1 className="mt-3 font-heading text-3xl font-bold">{title}</h1>
      <div className="mt-8 grid gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`rounded-card border p-4 text-left ${answers[key] === option ? 'border-primary-600 bg-primary-50' : 'bg-white'}`}
            onClick={() => setAnswers({ ...answers, [key]: option })}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button
          disabled={!answers[key]}
          onClick={() =>
            step === 3
              ? navigate(`/mentors?q=${encodeURIComponent(answers.goal)}`)
              : setStep(step + 1)
          }
        >
          {step === 3 ? 'Find mentors' : 'Continue'}
        </Button>
      </div>
    </main>
  );
}

export function ContentLanding({ exam = false }: { exam?: boolean }) {
  const params = useParams();
  const [data, setData] = useState<{
    name: string;
    subjects?: Array<{ name: string; slug: string }>;
  } | null>(null);
  useEffect(() => {
    const url = exam
      ? `/content/exams/${params.examSlug}`
      : params.subjectSlug
        ? `/content/categories/${params.categorySlug}/${params.subjectSlug}`
        : `/content/categories/${params.categorySlug}`;
    void api
      .get(url)
      .then(({ data: response }) =>
        setData(exam ? response.data : (response.data.subject ?? response.data.category)),
      )
      .catch(() => setData(null));
  }, [exam, params.categorySlug, params.examSlug, params.subjectSlug]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <Seo title={data?.name || 'Learn with Prepant'} />
      <h1 className="font-heading text-4xl font-bold">{data?.name || 'Explore learning paths'}</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Build confidence with a verified mentor and a plan tailored to your goals.
      </p>
      {data?.subjects && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {data.subjects.map((subject) => (
            <Link
              className="rounded-card border bg-white p-5 font-semibold hover:border-primary-500"
              to={`/mentors?q=${encodeURIComponent(subject.name)}`}
              key={subject.slug}
            >
              {subject.name}
              <span className="ml-2 text-primary-600">→</span>
            </Link>
          ))}
        </div>
      )}
      <Button className="mt-8" asChild>
        <Link to="/mentors">Browse mentors</Link>
      </Button>
    </main>
  );
}

export function BookingPage() {
  const { slug = '' } = useParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [duration, setDuration] = useState(30);
  const [done, setDone] = useState(false);
  useEffect(() => {
    void api.get(`/mentors/${slug}`).then(({ data }) => setMentor(data.data));
  }, [slug]);
  useEffect(() => {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
    void api
      .get('/bookings/slots', {
        params: {
          mentorSlug: slug,
          from,
          to,
          duration,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })
      .then(({ data }) => setSlots(Object.values(data.data).flat() as string[]));
  }, [slug, duration]);
  const book = async () => {
    if (!selected || !mentor) return;
    try {
      const subject = mentor.subjectIds?.[0];
      if (!subject) throw new Error('Choose a subject from the mentor profile');
      const response = await api.post('/bookings', {
        mentorSlug: slug,
        subject,
        startAt: selected,
        durationMins: duration,
        type: 'trial',
      });
      await api.post(`/bookings/${response.data.data.booking._id}/verify`, {
        paymentId: `mock_${Date.now()}`,
        signature: '',
      });
      setDone(true);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  if (done)
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <Seo title="Booking confirmed" />
        <h1 className="font-heading text-3xl font-bold">Your session is confirmed</h1>
        <p className="mt-3 text-slate-600">
          Your mentor and classroom details are available in your sessions.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/app">Go to dashboard</Link>
        </Button>
      </main>
    );
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Seo title={`Book a session with ${mentor?.name || 'mentor'}`} />
      <h1 className="font-heading text-3xl font-bold">Book with {mentor?.name || 'your mentor'}</h1>
      <p className="mt-2 text-slate-600">
        Choose a duration and an available time in your local timezone.
      </p>
      <div className="mt-8 flex gap-2">
        {[30, 60].map((value) => (
          <Button
            key={value}
            variant={duration === value ? 'default' : 'outline'}
            onClick={() => setDuration(value)}
          >
            {value} minutes
          </Button>
        ))}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setSelected(slot)}
            className={`rounded-card border p-3 text-left ${selected === slot ? 'border-primary-600 bg-primary-50' : 'bg-white'}`}
          >
            {new Date(slot).toLocaleString()}
          </button>
        ))}
        {!slots.length && <p className="text-slate-500">No open slots in the next few days.</p>}
      </div>
      <Button className="mt-8" disabled={!selected} onClick={book}>
        Book discounted trial
      </Button>
    </main>
  );
}

export function BlogList() {
  const [posts, setPosts] = useState<Array<{ slug: string; title: string; excerpt: string }>>([]);
  useEffect(() => {
    void api.get('/posts').then(({ data }) => setPosts(data.data));
  }, []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <Seo title="Prepant learning journal" />
      <h1 className="font-heading text-4xl font-bold">Learning journal</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="rounded-card border bg-white p-6"
          >
            <h2 className="font-heading text-xl font-bold">{post.title}</h2>
            <p className="mt-2 text-slate-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function BlogPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<{ title: string; contentMarkdown: string } | null>(null);
  useEffect(() => {
    void api.get(`/posts/${slug}`).then(({ data }) => setPost(data.data));
  }, [slug]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Seo title={post?.title || 'Learning journal'} />
      <h1 className="font-heading text-4xl font-bold">{post?.title || 'Post not found'}</h1>
      <div className="mt-8 whitespace-pre-wrap leading-8 text-slate-700">
        {post?.contentMarkdown}
      </div>
    </main>
  );
}
