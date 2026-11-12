import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Seo } from '../../components/common/Seo.js';

type Dashboard = {
  todaySessions: number;
  upcoming: Array<{ _id: string; startAt: string; student?: { name: string } }>;
  earnings: Array<{ _id: string; totalPaise: number }>;
  profile?: { completeness: number; status: string };
};
type Row = {
  _id: string;
  status: string;
  createdAt: string;
  amountPaise?: number;
  title?: string;
  name?: string;
  email?: string;
  reference?: string;
};

export function MentorDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  useEffect(() => {
    void api
      .get('/mentor/dashboard')
      .then(({ data: response }) => setData(response.data))
      .catch(() => toast.error('Could not load dashboard'));
  }, []);
  return (
    <div className="p-6">
      <Seo title="Mentor dashboard" />
      <h1 className="font-heading text-2xl font-bold">Mentor dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border bg-white p-5">
          <p className="text-sm text-slate-500">Today</p>
          <p className="mt-2 text-3xl font-bold">{data?.todaySessions ?? '—'}</p>
          <p className="text-sm text-slate-500">sessions</p>
        </div>
        <div className="rounded-card border bg-white p-5">
          <p className="text-sm text-slate-500">Profile</p>
          <p className="mt-2 text-3xl font-bold">{data?.profile?.completeness ?? 0}%</p>
          <p className="text-sm text-slate-500">{data?.profile?.status || 'draft'}</p>
        </div>
        <div className="rounded-card border bg-white p-5">
          <p className="text-sm text-slate-500">Upcoming</p>
          <p className="mt-2 text-3xl font-bold">{data?.upcoming.length ?? '—'}</p>
          <p className="text-sm text-slate-500">next sessions</p>
        </div>
      </div>
      <h2 className="mt-8 font-heading text-xl font-bold">Upcoming sessions</h2>
      <div className="mt-4 space-y-3">
        {data?.upcoming.map((item) => (
          <div key={item._id} className="rounded-card border bg-white p-4">
            {new Date(item.startAt).toLocaleString()}{' '}
            {item.student?.name ? `· ${item.student.name}` : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EarningsPage() {
  const [data, setData] = useState<{
    entries: Row[];
    totals: Array<{ _id: string; totalPaise: number }>;
  } | null>(null);
  const [amount, setAmount] = useState('');
  useEffect(() => {
    void api.get('/mentor/earnings').then(({ data: response }) => setData(response.data));
  }, []);
  const request = async () => {
    try {
      await api.post('/mentor/payouts', { amountPaise: Number(amount) });
      toast.success('Payout requested');
      setAmount('');
    } catch {
      toast.error('Could not request payout');
    }
  };
  return (
    <div className="p-6">
      <Seo title="Mentor earnings" />
      <h1 className="font-heading text-2xl font-bold">Earnings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {data?.totals.map((total) => (
          <div className="rounded-card border bg-white p-5" key={total._id}>
            <p className="text-sm capitalize text-slate-500">{total._id}</p>
            <p className="mt-2 text-2xl font-bold">
              ₹{(total.totalPaise / 100).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex max-w-md gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount in paise"
        />
        <Button onClick={request}>Request payout</Button>
      </div>
    </div>
  );
}

export function AdminOperations({
  type,
}: {
  type:
    | 'stats'
    | 'users'
    | 'bookings'
    | 'payments'
    | 'payouts'
    | 'reviews'
    | 'leads'
    | 'blog'
    | 'settings'
    | 'audit';
}) {
  const [data, setData] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [reference, setReference] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: '25' });
    if (status && (type === 'leads' || type === 'bookings')) query.set('status', status);
    void api
      .get(type === 'stats' ? '/admin/stats' : `/admin/${type}?${query}`)
      .then(({ data: response }) =>
        type === 'stats'
          ? setStats(response.data)
          : (setData(response.data), setTotalPages(response.meta?.totalPages ?? 1)),
      );
  }, [page, status, type]);
  useEffect(() => setPage(1), [type, status]);
  const label = type[0].toUpperCase() + type.slice(1);
  const updateStatus = async (id: string, nextStatus: 'active' | 'blocked') => {
    await api.patch(`/admin/users/${id}/status`, { status: nextStatus });
    setData((current) =>
      current.map((item) =>
        (item as Row)._id === id ? { ...(item as Row), status: nextStatus } : item,
      ),
    );
    toast.success(`User ${nextStatus}`);
  };
  return (
    <div className="p-6">
      <Seo title={`Admin ${label}`} />
      <h1 className="font-heading text-2xl font-bold">{label}</h1>
      {stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {Object.entries(stats).map(
            ([key, value]) =>
              typeof value === 'number' && (
                <div className="rounded-card border bg-white p-5" key={key}>
                  <p className="text-sm text-slate-500">{key}</p>
                  <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
                </div>
              ),
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(type === 'leads' || type === 'bookings') && (
            <select
              className="rounded border p-2"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {type === 'leads' ? (
                <>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </>
              ) : (
                <>
                  <option value="needs_review">Needs review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </>
              )}
            </select>
          )}
          {type === 'leads' && (
            <Button onClick={() => window.open('/api/v1/admin/leads.csv', '_blank')}>
              Export CSV
            </Button>
          )}
          {loading && <p className="text-slate-500">Loading…</p>}
          {data.map((item) => {
            const row = item as Row;
            return (
              <div
                key={row._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border bg-white p-4"
              >
                <div>
                  <p className="font-semibold">{row.name || row.title || row._id}</p>
                  <p className="text-sm text-slate-500">
                    {row.status || row.email || row.createdAt}
                  </p>
                </div>
                {type === 'users' && (
                  <Button
                    onClick={() =>
                      void updateStatus(row._id, row.status === 'blocked' ? 'active' : 'blocked')
                    }
                  >
                    {row.status === 'blocked' ? 'Unblock' : 'Block'}
                  </Button>
                )}
                {type === 'payouts' && row.status === 'requested' && (
                  <div className="flex gap-2">
                    <Input
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      placeholder="Reference"
                    />
                    <Button
                      onClick={() =>
                        api
                          .post(`/admin/payouts/${row._id}/pay`, { reference })
                          .then(() => toast.success('Payout marked paid'))
                      }
                    >
                      Mark paid
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        api
                          .post(`/admin/payouts/${row._id}/reject`, { note: 'Rejected by admin' })
                          .then(() => toast.success('Payout rejected'))
                      }
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {!data.length && <p className="text-slate-500">No records found.</p>}
          {totalPages > 1 && (
            <div className="flex items-center gap-3 pt-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
