import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { getSocket } from '../../lib/socket.js';
import { Button } from '../../components/ui/button.js';
import { Input } from '../../components/ui/input.js';
import { Seo } from '../../components/common/Seo.js';

type Conversation = {
  _id: string;
  participants: Array<{ _id: string; name: string; role: string }>;
  lastMessage?: { text: string };
  unread?: { student: number; mentor: number };
};
type Message = {
  _id: string;
  conversation: string;
  body: string;
  sender: { _id: string; name: string };
  createdAt: string;
};

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<
    Array<{ _id: string; mentor: { _id: string; name: string } }>
  >([]);
  useEffect(() => {
    void api.get('/favorites').then(({ data }) => setFavorites(data.data));
  }, []);
  return (
    <div className="p-6">
      <Seo title="Favorites" />
      <h1 className="font-heading text-2xl font-bold">Favorite mentors</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {favorites.map((favorite) => (
          <div
            key={favorite._id}
            className="flex items-center justify-between rounded-card border bg-white p-4"
          >
            <span className="font-semibold">{favorite.mentor.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                api
                  .delete(`/favorites/${favorite.mentor._id}`)
                  .then(() => setFavorites(favorites.filter((item) => item._id !== favorite._id)))
              }
            >
              Remove
            </Button>
          </div>
        ))}
        {!favorites.length && (
          <p className="text-slate-500">Save mentors from their profiles to find them quickly.</p>
        )}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Array<{ _id: string; title: string; body: string; readAt?: string; link?: string }>
  >([]);
  useEffect(() => {
    void api.get('/notifications').then(({ data }) => setNotifications(data.data));
  }, []);
  const markAll = async () => {
    await api.post('/notifications/read-all');
    setNotifications(notifications.map((item) => ({ ...item, readAt: new Date().toISOString() })));
  };
  return (
    <div className="p-6">
      <Seo title="Notifications" />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAll}>
          Mark all read
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {notifications.map((item) => (
          <Link
            key={item._id}
            to={item.link || '#'}
            className={`block rounded-card border p-4 ${item.readAt ? 'bg-white' : 'border-primary-200 bg-primary-50'}`}
          >
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          </Link>
        ))}
        {!notifications.length && <p className="text-slate-500">You are all caught up.</p>}
      </div>
    </div>
  );
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  useEffect(() => {
    void api.get('/conversations').then(({ data }) => {
      setConversations(data.data);
      setSelected(data.data[0] ?? null);
    });
  }, []);
  useEffect(() => {
    if (!selected) return;
    void api
      .get(`/conversations/${selected._id}/messages`)
      .then(({ data }) => setMessages(data.data));
    const socket = getSocket();
    socket?.emit('conversation:join', selected._id);
    const handler = (message: Message) => {
      if (message.conversation === selected._id) setMessages((current) => [...current, message]);
    };
    socket?.on('message:new', handler);
    return () => {
      socket?.off('message:new', handler);
      socket?.emit('conversation:leave', selected._id);
    };
  }, [selected]);
  const send = async () => {
    if (!selected || !body.trim()) return;
    try {
      const response = await api.post(`/conversations/${selected._id}/messages`, { body });
      setMessages([...messages, response.data.data]);
      setBody('');
    } catch {
      toast.error('Could not send message');
    }
  };
  return (
    <div className="grid min-h-[65vh] gap-4 p-6 md:grid-cols-[260px_1fr]">
      <Seo title="Messages" />
      <aside className="rounded-card border bg-white p-3">
        <h1 className="px-3 py-2 font-heading text-xl font-bold">Messages</h1>
        {conversations.map((conversation) => (
          <button
            key={conversation._id}
            type="button"
            onClick={() => setSelected(conversation)}
            className={`w-full rounded-lg p-3 text-left ${selected?._id === conversation._id ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
          >
            <p className="font-semibold">
              {conversation.participants.map((participant) => participant.name).join(' · ')}
            </p>
            <p className="truncate text-xs text-slate-500">
              {conversation.lastMessage?.text || 'Start a conversation'}
            </p>
          </button>
        ))}
        {!conversations.length && (
          <p className="p-3 text-sm text-slate-500">Messages from your mentors will appear here.</p>
        )}
      </aside>
      <section className="flex min-h-[60vh] flex-col rounded-card border bg-white p-4">
        {selected ? (
          <>
            <div className="border-b pb-3 font-semibold">
              {selected.participants.map((participant) => participant.name).join(' · ')}
            </div>
            <div className="flex-1 space-y-3 overflow-auto py-4">
              {messages.map((message) => (
                <div key={message._id} className="rounded-lg bg-slate-100 p-3 text-sm">
                  <p>{message.body}</p>
                  <time className="mt-1 block text-xs text-slate-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void send();
                }}
                placeholder="Write a message..."
              />
              <Button onClick={send}>Send</Button>
            </div>
          </>
        ) : (
          <p className="m-auto text-slate-500">Select a conversation to begin.</p>
        )}
      </section>
    </div>
  );
}
