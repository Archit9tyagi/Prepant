import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Label } from '../../components/ui/label.js';

const passwordRules = z.string().min(8, 'Use at least 8 characters');
const Field = ({
  label,
  message,
  ...props
}: { label: string; message?: string } & React.ComponentProps<typeof Input>) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <Input {...props} />
    {message && <p className="text-sm text-red-600">{message}</p>}
  </div>
);
const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <main className="mx-auto max-w-md px-4 py-16">
    <h1 className="font-heading text-3xl font-bold">{title}</h1>
    <div className="mt-8 rounded-card border bg-white p-6 shadow-sm">{children}</div>
  </main>
);
const getError = (error: any) => error?.response?.data?.error?.message || 'Something went wrong';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm({
    resolver: zodResolver(z.object({ email: z.string().email(), password: passwordRules })),
  });
  const submit = form.handleSubmit(async (values) => {
    try {
      const { data } = await api.post('/auth/login', values);
      setSession(data.data);
      navigate((location.state as any)?.from?.pathname || '/app');
    } catch (e) {
      toast.error(getError(e));
    }
  });
  return (
    <Shell title="Log in">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          {...form.register('email')}
          message={form.formState.errors.email?.message as string}
        />
        <Field
          label="Password"
          type="password"
          {...form.register('password')}
          message={form.formState.errors.password?.message as string}
        />
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          Log in
        </Button>
        <Link className="block text-center text-sm text-primary-600" to="/forgot-password">
          Forgot password?
        </Link>
        <p className="text-center text-sm">
          New to Prepant?{' '}
          <Link className="text-primary-600" to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </Shell>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: passwordRules,
        consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) }),
      }),
    ),
  });
  const strength = (form.watch('password') || '').length;
  const submit = form.handleSubmit(async (values) => {
    try {
      const { data } = await api.post('/auth/register', { ...values, role });
      setSession(data.data);
      navigate(role === 'mentor' ? '/teach' : '/app');
      toast.success('Account created. Check your email to verify it.');
    } catch (e) {
      toast.error(getError(e));
    }
  });
  return (
    <Shell title="Create your account">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Name"
          {...form.register('name')}
          message={form.formState.errors.name?.message as string}
        />
        <Field
          label="Email"
          type="email"
          {...form.register('email')}
          message={form.formState.errors.email?.message as string}
        />
        <Field
          label="Password"
          type="password"
          {...form.register('password')}
          message={form.formState.errors.password?.message as string}
        />
        <div className="h-2 rounded bg-slate-200">
          <div
            className="h-2 rounded bg-primary-600"
            style={{ width: `${Math.min(strength * 10, 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={role === 'student' ? 'default' : 'outline'}
            onClick={() => setRole('student')}
          >
            I want to learn
          </Button>
          <Button
            type="button"
            variant={role === 'mentor' ? 'default' : 'outline'}
            onClick={() => setRole('mentor')}
          >
            I want to teach
          </Button>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...form.register('consent')} /> I agree to the Terms and Privacy
          Policy.
        </label>
        {form.formState.errors.consent && (
          <p className="text-sm text-red-600">{form.formState.errors.consent.message as string}</p>
        )}
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          Create account
        </Button>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  const form = useForm({ resolver: zodResolver(z.object({ email: z.string().email() })) });
  const submit = form.handleSubmit(async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      toast.success('If the account exists, a reset link has been sent.');
    } catch (e) {
      toast.error(getError(e));
    }
  });
  return (
    <Shell title="Reset your password">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          {...form.register('email')}
          message={form.formState.errors.email?.message as string}
        />
        <Button className="w-full">Send reset link</Button>
      </form>
    </Shell>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(z.object({ password: passwordRules })) });
  const submit = form.handleSubmit(async (values) => {
    try {
      await api.post('/auth/reset-password', { ...values, token });
      toast.success('Password updated.');
      navigate('/login');
    } catch (e) {
      toast.error(getError(e));
    }
  });
  return (
    <Shell title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          {...form.register('password')}
          message={form.formState.errors.password?.message as string}
        />
        <Button className="w-full">Update password</Button>
      </form>
    </Shell>
  );
}

export function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email…');
  React.useEffect(() => {
    void api
      .post('/auth/verify-email', { token })
      .then(() => setMessage('Email verified. You can now use Prepant.'))
      .catch(() => setMessage('This verification link is invalid or expired.'));
  }, [token]);
  return (
    <Shell title="Email verification">
      <p>{message}</p>
      <Link className="mt-4 inline-block text-primary-600" to="/login">
        Continue to log in
      </Link>
    </Shell>
  );
}

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      timezone: user?.timezone || 'Asia/Kolkata',
      phone: user?.phone || '',
    },
  });
  const save = form.handleSubmit(async (values) => {
    try {
      const { data } = await api.patch('/users/me', values);
      useAuthStore.getState().setUser(data.data);
      toast.success('Profile saved.');
    } catch (e) {
      toast.error(getError(e));
    }
  });
  const remove = async () => {
    if (!window.confirm('Delete your account?')) return;
    await api.delete('/users/me');
    logout();
    window.location.assign('/');
  };
  return (
    <Shell title="Settings">
      <form onSubmit={save} className="space-y-4">
        <Field label="Name" {...form.register('name')} />
        <Field label="Phone" {...form.register('phone')} />
        <Field label="Time zone" {...form.register('timezone')} />
        <Button>Save profile</Button>
      </form>
      <hr className="my-8" />
      <Button variant="destructive" onClick={remove}>
        Delete account
      </Button>
    </Shell>
  );
}
