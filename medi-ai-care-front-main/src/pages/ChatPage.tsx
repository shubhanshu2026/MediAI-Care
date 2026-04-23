import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  sendMessage, getConversation, getDoctorContacts, getPatientContacts,
  Message, Contact
} from '@/api/messageApi';
import { Send, MessageCircle, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuth();
  const isDoctor = user?.role?.toUpperCase() === 'DOCTOR';

  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [activeContact, setActive]  = useState<Contact | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [draft, setDraft]           = useState('');
  const [loadingContacts, setLC]    = useState(true);
  const [loadingMsgs, setLM]        = useState(false);
  const [sending, setSending]       = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load contacts ─────────────────────────────────────────────────────────
  // FIX: Previously this derived contacts from appointments using
  //      a.patientId ?? 0, which was ALWAYS 0 because Appointment entity
  //      had no patientId field. Now we call dedicated endpoints that read
  //      from the doctor_patient_relations table (populated on APPROVE).
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        setLC(true);
        // FIX: Doctor contacts must use doctorId (doctors.id), not user.id (users.id)
        //      Otherwise getDoctorContacts returns empty because relations are stored with doctors.id
        const effectiveId = isDoctor ? Number(user.doctorId || user.id) : Number(user.id);
        const { data } = isDoctor
          ? await getDoctorContacts(effectiveId)
          : await getPatientContacts(effectiveId);
        setContacts(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Could not load contacts. Make sure you have approved appointments.');
      } finally {
        setLC(false);
      }
    };
    load();
  }, [user?.id, isDoctor]);

  // ── Load (and poll) messages ──────────────────────────────────────────────
  const loadMessages = async (contact: Contact) => {
    if (!user?.id) return;
    try {
      setLM(true);
      const { data } = await getConversation(Number(user.id), contact.id);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load messages.');
    } finally {
      setLM(false);
    }
  };

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeContact) return;

    loadMessages(activeContact);
    // Poll every 5 s for a lightweight real-time feel
    pollRef.current = setInterval(() => loadMessages(activeContact), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeContact]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!draft.trim() || !activeContact || !user?.id) return;
    setSending(true);
    try {
      const { data } = await sendMessage({
        senderId:   Number(user.id),
        receiverId: activeContact.id,
        message:    draft.trim(),
      });
      setMessages(prev => [...prev, data]);
      setDraft('');
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (ts?: string) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border shadow-sm">

      {/* ── Contacts Sidebar ────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">
              {isDoctor ? 'My Patients' : 'My Doctors'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground">Loading contacts…</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center">
              <User className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isDoctor
                  ? 'No patients yet. Approve an appointment to start chatting.'
                  : 'No doctors yet. Book and get an appointment approved to chat.'}
              </p>
            </div>
          ) : (
            contacts.map(c => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/50 transition-colors hover:bg-muted/40 ${
                  activeContact?.id === c.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Chat Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-card">
          {activeContact ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {activeContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{activeContact.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{activeContact.role}</p>
                </div>
              </div>
              <button
                onClick={() => loadMessages(activeContact)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a contact from the sidebar to start chatting
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
          {!activeContact ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Choose a {isDoctor ? 'patient' : 'doctor'} from the sidebar to begin
              </p>
            </div>
          ) : loadingMsgs ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-xs text-muted-foreground">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = Number(msg.senderId) === Number(user?.id);
              return (
                <div key={msg.id ?? i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {activeContact && (
          <div className="px-4 py-3 border-t border-border bg-card flex items-center gap-3">
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message ${activeContact.name}…`}
              className="flex-1 bg-muted/30 border-muted focus-visible:ring-primary"
              disabled={sending}
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleSend}
              disabled={sending || !draft.trim()}
            >
              {sending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
