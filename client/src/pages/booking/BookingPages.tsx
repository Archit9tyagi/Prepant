import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Seo } from '../../components/common/Seo.js';
import { useAuthStore } from '../../store/authStore.js';

type Availability = {
  timezone: string;
  weekly: Array<{ dayOfWeek: number; start: string; end: string }>;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
};

export function MentorAvailability() {
  const [value, setValue] = useState<Availability>({
    timezone: 'Asia/Kolkata',
    weekly: [],
    bufferMinutes: 0,
    minNoticeHours: 12,
    maxAdvanceDays: 60,
  });
  useEffect(() => {
    void api.get('/mentor/availability').then(({ data }) => data.data && setValue(data.data));
  }, []);
  const save = async () => {
    try {
      await api.put('/mentor/availability', value);
      toast.success('Availability saved');
    } catch {
      toast.error('Could not save availability');
    }
  };
  return (
    <div className="p-6">
      <Seo title="Availability" />
      <h1 className="font-heading text-2xl font-bold">Availability</h1>
      <p className="mt-2 text-sm text-slate-600">
        Set your weekly teaching hours. Learners see these times in their own timezone.
      </p>
      <div className="mt-6 max-w-2xl space-y-3 rounded-card border bg-white p-5">
        <Input
          value={value.timezone}
          onChange={(event) => setValue({ ...value, timezone: event.target.value })}
          placeholder="IANA timezone"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="number"
            value={value.minNoticeHours}
            onChange={(event) => setValue({ ...value, minNoticeHours: Number(event.target.value) })}
            placeholder="Minimum notice hours"
          />
          <Input
            type="number"
            value={value.maxAdvanceDays}
            onChange={(event) => setValue({ ...value, maxAdvanceDays: Number(event.target.value) })}
            placeholder="Advance days"
          />
        </div>
        <Button onClick={save}>Save availability</Button>
      </div>
    </div>
  );
}

export function Sessions() {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<
    Array<{ _id: string; startAt: string; status: string; durationMins: number; endAt?: string }>
  >([]);
  useEffect(() => {
    void api
      .get('/bookings')
      .then(({ data }) => setBookings(data.data))
      .catch(() => toast.error('Could not load sessions'))
      .finally(() => setLoading(false));
  }, []);
  const visible = bookings.filter((booking) => {
    if (filter === 'cancelled') return booking.status.startsWith('cancelled');
    if (filter === 'past')
      return ['completed', 'no_show_student', 'no_show_mentor'].includes(booking.status);
    return ['confirmed', 'pending_payment'].includes(booking.status);
  });
  const updateBooking = (id: string, status: string) =>
    setBookings((current) => current.map((item) => (item._id === id ? { ...item, status } : item)));
  return (
    <div className="p-6">
      <Seo title="Sessions" />
      <h1 className="font-heading text-2xl font-bold">My sessions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['upcoming', 'past', 'cancelled'] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={filter === item ? 'default' : 'outline'}
            onClick={() => setFilter(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-500">Loading sessions...</p>}
        {!loading &&
          visible.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center justify-between rounded-card border bg-white p-4"
            >
              <div>
                <p className="font-semibold">{new Date(booking.startAt).toLocaleString()}</p>
                <p className="text-sm text-slate-500">
                  {booking.durationMins} minutes · {booking.status}
                </p>
              </div>
              <div className="flex gap-2">
                {booking.status === 'confirmed' && (
                  <Button asChild size="sm">
                    <Link to={`/classroom/${booking._id}`}>Join</Link>
                  </Button>
                )}
                {booking.status === 'confirmed' && user?.role === 'student' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const next = window.prompt('New start time (ISO format)');
                        if (!next) return;
                        void api
                          .post(`/bookings/${booking._id}/reschedule`, { startAt: next })
                          .then(({ data }) => {
                            setBookings((current) =>
                              current.map((item) =>
                                item._id === booking._id ? { ...item, ...data.data } : item,
                              ),
                            );
                            toast.success('Session rescheduled');
                          })
                          .catch(() => toast.error('Could not reschedule session'));
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void api
                          .post(`/bookings/${booking._id}/cancel`, { reason: 'Changed plans' })
                          .then(({ data }) => updateBooking(booking._id, data.data.status))
                          .catch(() => toast.error('Could not cancel session'))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === 'confirmed' && user?.role === 'mentor' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void api
                          .post(`/bookings/${booking._id}/complete`)
                          .then(({ data }) => updateBooking(booking._id, data.data.status))
                          .catch(() => toast.error('Could not complete session'))
                      }
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void api
                          .post(`/bookings/${booking._id}/no-show`, { side: 'student' })
                          .then(({ data }) => updateBooking(booking._id, data.data.status))
                          .catch(() => toast.error('Could not record no-show'))
                      }
                    >
                      Student no-show
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        {!loading && !visible.length && <p className="text-slate-500">No sessions in this view.</p>}
      </div>
    </div>
  );
}

export function Classroom() {
  const { bookingId = '' } = useParams();
  const [meeting, setMeeting] = useState<{ url: string } | null>(null);
  useEffect(() => {
    void api
      .get(`/bookings/${bookingId}/join`)
      .then(({ data }) => setMeeting(data.data))
      .catch(() => toast.error('The classroom is not open yet'));
  }, [bookingId]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Seo title="Classroom" />
      <h1 className="font-heading text-3xl font-bold">Your classroom</h1>
      <p className="mt-2 text-slate-600">
        Complete your pre-join checks, then join the secure session room.
      </p>
      {meeting ? (
        <Button className="mt-8" asChild>
          <a href={meeting.url} target="_blank" rel="noreferrer">
            Join Jitsi room
          </a>
        </Button>
      ) : (
        <p className="mt-8 rounded-card bg-amber-50 p-4 text-amber-800">
          The classroom opens 10 minutes before your session.
        </p>
      )}
    </main>
  );
}
