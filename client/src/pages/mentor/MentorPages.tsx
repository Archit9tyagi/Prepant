import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Label } from '../../components/ui/label.js';
import { useAuthStore } from '../../store/authStore.js';

type Profile = {
  _id?: string;
  slug?: string;
  headline?: string;
  bio?: string;
  hourlyRatePaise?: number;
  durations?: number[];
  status?: string;
  completeness?: number;
  subjects?: Array<{ subject: string; levels: string[]; boards: string[] }>;
  languages?: Array<{ code: string; level: string }>;
  experienceYears?: number;
  introVideo?: { provider: 'youtube' | 'vimeo' | 'upload'; url: string };
  payout?: { method: 'upi' | 'bank'; encryptedDetails: string };
};

const errorMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
    ?.message || 'Something went wrong';

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

export function BecomeMentor() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wider text-primary-600">
          Teach on Prepant
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold text-slate-950">
          Turn what you know into someone’s next breakthrough.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Build a flexible teaching practice with one-to-one learners, clear tools and a profile
          that shows your experience.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/signup">Create a mentor account</Link>
        </Button>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          ['Set your expertise', 'Choose subjects, levels and a rate that fit your teaching.'],
          ['Meet the right learners', 'Your profile is reviewed before it is published.'],
          ['Teach with flexibility', 'Shape your availability around the work and life you have.'],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-card border bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export function MentorOnboarding() {
  const [profile, setProfile] = useState<Profile>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void api
      .get('/mentor/profile')
      .then(({ data }) => setProfile(data.data))
      .catch((error) => toast.error(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof Profile, value: unknown) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const save = async () => {
    try {
      const { data } = await api.put('/mentor/profile', profile);
      setProfile(data.data);
      toast.success('Progress saved');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const submit = async () => {
    try {
      const { data } = await api.post('/mentor/profile/submit');
      setProfile(data.data);
      toast.success('Profile sent for review');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your onboarding…</div>;
  if (!user) return null;

  const steps = ['Basics', 'Subjects and rate', 'Experience', 'Intro video', 'Payout', 'Review'];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            onClick={() => setStep(index)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${step === index ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>
      <section className="mt-6 rounded-card border bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Tell learners about you</h1>
            <Field
              label="Headline"
              value={profile.headline || ''}
              onChange={(value) => update('headline', value)}
            />
            <div className="space-y-1">
              <Label>Bio</Label>
              <textarea
                className="min-h-32 w-full rounded-[10px] border p-3 text-sm"
                value={profile.bio || ''}
                onChange={(event) => update('bio', event.target.value)}
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Set your teaching offer</h1>
            <Field
              label="Hourly rate (paise)"
              type="number"
              value={String(profile.hourlyRatePaise || '')}
              onChange={(value) => update('hourlyRatePaise', Number(value))}
            />
            <Field
              label="Subjects (comma separated IDs)"
              value={(profile.subjects || []).map((item) => item.subject).join(',')}
              onChange={(value) =>
                update(
                  'subjects',
                  value
                    .split(',')
                    .filter(Boolean)
                    .map((subject) => ({
                      subject: subject.trim(),
                      levels: ['beginner'],
                      boards: [],
                    })),
                )
              }
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Show your experience</h1>
            <Field
              label="Years of experience"
              type="number"
              value={String(profile.experienceYears || '')}
              onChange={(value) => update('experienceYears', Number(value))}
            />
            <p className="text-sm text-slate-600">
              Certificates can be uploaded after saving your profile.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Add an intro video</h1>
            <Field
              label="Video URL"
              value={profile.introVideo?.url || ''}
              onChange={(url) => update('introVideo', { provider: 'youtube', url })}
            />
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Payout details</h1>
            <Field
              label="Payout method"
              value={profile.payout?.method || 'upi'}
              onChange={(method) =>
                update('payout', {
                  method,
                  encryptedDetails: profile.payout?.encryptedDetails || '',
                })
              }
            />
            <Field
              label="Payout details"
              value={profile.payout?.encryptedDetails || ''}
              onChange={(encryptedDetails) =>
                update('payout', { method: profile.payout?.method || 'upi', encryptedDetails })
              }
            />
          </div>
        )}
        {step === 5 && (
          <div>
            <h1 className="font-heading text-2xl font-bold">Review your application</h1>
            <p className="mt-3 text-sm text-slate-600">
              Completeness: {profile.completeness || 0}%. Status: {profile.status || 'draft'}.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Availability will be added in the booking phase.
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => void save()}>
              Save progress
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => setStep((value) => value + 1)}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={() => void submit()}>
                Submit for review
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AdminMentors() {
  const [status, setStatus] = useState('pending');
  const [mentors, setMentors] = useState<Profile[]>([]);
  const load = () =>
    void api
      .get(`/admin/mentors?status=${status}`)
      .then(({ data }) => setMentors(data.data))
      .catch((error) => toast.error(errorMessage(error)));
  useEffect(load, [status]);
  const action = async (id: string, operation: 'approve' | 'reject' | 'suspend') => {
    try {
      await api.post(
        `/admin/mentors/${id}/${operation}`,
        operation === 'approve'
          ? {}
          : { reason: 'Please update the profile information and resubmit.' },
      );
      toast.success(`Mentor ${operation}d`);
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mentor review queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review profile completeness before publishing a mentor.
        </p>
      </div>
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'suspended'].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? 'default' : 'outline'}
            onClick={() => setStatus(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <div className="overflow-hidden rounded-card border bg-white">
        {mentors.map((mentor) => (
          <div
            key={mentor._id}
            className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-0"
          >
            <div>
              <h2 className="font-bold">{mentor.headline || 'Untitled mentor profile'}</h2>
              <p className="text-sm text-slate-500">
                {mentor.status} · {mentor.completeness || 0}% complete
              </p>
            </div>
            <div className="flex gap-2">
              {status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => void action(mentor._id!, 'approve')}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void action(mentor._id!, 'reject')}
                  >
                    Reject
                  </Button>
                </>
              )}
              {status === 'approved' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => void action(mentor._id!, 'suspend')}
                >
                  Suspend
                </Button>
              )}
            </div>
          </div>
        ))}
        {mentors.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">No mentors in this queue.</p>
        )}
      </div>
    </section>
  );
}

export function AdminCatalog() {
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>(
    [],
  );
  const [name, setName] = useState('');
  const load = () =>
    void api
      .get('/admin/categories')
      .then(({ data }) => setCategories(data.data))
      .catch((error) => toast.error(errorMessage(error)));
  useEffect(load, []);
  const create = async () => {
    try {
      await api.post('/admin/categories', { name, icon: 'BookOpen' });
      setName('');
      load();
      toast.success('Category created');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Catalog</h1>
        <p className="mt-1 text-sm text-slate-600">Manage the categories used across Prepant.</p>
      </div>
      <div className="flex max-w-lg gap-2">
        <Input
          placeholder="New category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button onClick={() => void create()} disabled={!name.trim()}>
          Add category
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category._id} className="rounded-card border bg-white p-4">
            <p className="font-bold">{category.name}</p>
            <p className="text-xs text-slate-500">{category.slug}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
