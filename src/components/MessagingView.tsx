import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Heart, MoreHorizontal, MessageCircle,
  Send, ArrowLeft, Image, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { messagesService } from '../services/messages.service';
import { useAuth } from '../hooks/useAuth';
import type { ConversationWithDetails, Message } from '../types/database';

interface Props {
  onBack: () => void;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Hier';
  if (days < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const AVATAR_COLORS = ['#00875A', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

function getColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitial(name: string | null): string {
  return (name ?? '?').charAt(0).toUpperCase();
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function MessagingView({ onBack }: Props) {
  const { user } = useAuth();
  const [convs, setConvs] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof messagesService.subscribeToConversation> | null>(null);

  // Load conversations on mount
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    loadConversations();

    const convChannel = messagesService.subscribeToConversations(user.id, (updated) => {
      setConvs(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    });

    return () => { messagesService.unsubscribe(convChannel); };
  }, [user]);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await messagesService.getConversations();
      setConvs(data);
    } catch (e) {
      console.error('Erreur chargement conversations:', e);
    } finally {
      setLoading(false);
    }
  }

  // Load messages when active conv changes + subscribe
  useEffect(() => {
    if (!activeId) return;

    messagesService.getMessages(activeId).then(setMessages);
    messagesService.markAsRead(activeId);

    if (channelRef.current) messagesService.unsubscribe(channelRef.current);
    channelRef.current = messagesService.subscribeToConversation(activeId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      if (channelRef.current) {
        messagesService.unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  function getOtherUser(conv: ConversationWithDetails) {
    if (!user) return null;
    return conv.buyer_id === user.id ? conv.seller : conv.buyer;
  }

  function getUnread(conv: ConversationWithDetails): number {
    if (!user) return 0;
    return conv.buyer_id === user.id
      ? (conv.buyer_unread_count ?? 0)
      : (conv.seller_unread_count ?? 0);
  }

  function getListingImage(conv: ConversationWithDetails): string | null {
    const images = conv.listings?.listing_images;
    if (!images || images.length === 0) return null;
    const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return sorted[0].url;
  }

  function handleBack() {
    if (showMobileChat) {
      setShowMobileChat(false);
    } else {
      onBack();
    }
  }

  const activeConv = convs.find(c => c.id === activeId) ?? null;

  function openConversation(id: string) {
    setActiveId(id);
    setShowMobileChat(true);
    setConvs(prev => prev.map(c => {
      if (c.id !== id || !user) return c;
      return user.id === c.buyer_id
        ? { ...c, buyer_unread_count: 0 }
        : { ...c, seller_unread_count: 0 };
    }));
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !activeId) return;
    setInput('');

    try {
      await messagesService.sendMessage(activeId, text);
      // Reload conversations to update last_message preview
      const updated = await messagesService.getConversations();
      setConvs(updated);
    } catch (e) {
      console.error('Erreur envoi message:', e);
      setInput(text);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const activeOther = activeConv ? getOtherUser(activeConv) : null;
  const isListingDeleted = activeConv ? !activeConv.listings : false;
  const totalUnread = convs.reduce((sum, c) => sum + getUnread(c), 0);
  const displayedConvs = filter === 'unread' ? convs.filter(c => getUnread(c) > 0) : convs;

  function getMessagesWithSeparators(msgs: Message[]) {
    const result: Array<{ type: 'separator'; date: string } | { type: 'msg'; msg: Message }> = [];
    let lastDate: string | null = null;
    for (const msg of msgs) {
      if (!lastDate || !isSameDay(lastDate, msg.created_at)) {
        result.push({ type: 'separator', date: msg.created_at });
        lastDate = msg.created_at;
      }
      result.push({ type: 'msg', msg });
    }
    return result;
  }

  if (!user) {
    return (
      <div className="messages-container">
        <div className="chat-empty-state">
          <MessageCircle size={48} color="#ddd" />
          <p>Connectez-vous pour accéder à vos messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">

        {/* ── Sidebar conversations ── */}
        <aside className={`messages-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-header-top">
              <button className="btn-back-main" onClick={handleBack}>
                <ArrowLeft size={20} />
              </button>
              <div className="msg-page-title">
                Messages
                {totalUnread > 0 && <span className="unread-total-badge">{totalUnread}</span>}
              </div>
            </div>
            <div className="filter-tabs">
              <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                Tout
              </button>
              <button className={`tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                Non lus
                {totalUnread > 0 && <span className="tab-badge">{totalUnread}</span>}
              </button>
            </div>
          </div>

          <div className="conversation-list">
            {loading ? (
              <div className="empty-conversations">
                <div className="loading-spinner" />
                <p>Chargement…</p>
              </div>
            ) : displayedConvs.length === 0 ? (
              <div className="empty-conversations">
                <MessageCircle size={32} color="#ccc" />
                <p>{filter === 'unread' ? 'Aucune conversation non lue' : 'Aucun message pour l\'instant'}</p>
                {filter === 'all' && (
                  <p className="empty-hint">Contactez un vendeur pour démarrer une conversation</p>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {displayedConvs.map(conv => {
                  const other = getOtherUser(conv);
                  const unread = getUnread(conv);
                  const listingImg = getListingImage(conv);
                  const isDeleted = !conv.listings;
                  return (
                    <motion.div
                      key={conv.id}
                      className={`conv-item ${conv.id === activeId ? 'selected' : ''}`}
                      onClick={() => openConversation(conv.id)}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {conv.id === activeId && <div className="active-indicator" />}

                      <div className="conv-thumbnail" style={{ background: isDeleted ? '#f0f0f0' : undefined }}>
                        {isDeleted
                          ? <span style={{ fontSize: 20 }}>🚫</span>
                          : listingImg
                            ? <img src={listingImg} alt="" />
                            : (
                              <div style={{
                                background: other ? getColor(other.id) : '#ccc',
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: 18
                              }}>
                                {getInitial(other?.full_name ?? null)}
                              </div>
                            )
                        }
                      </div>

                      <div className="conv-info">
                        <div className="conv-top-row">
                          <p className={`conv-title ${unread > 0 ? 'unread-title' : ''}`}>
                            {isDeleted ? 'Annonce supprimée' : (conv.listings?.title ?? '')}
                          </p>
                          <span className="conv-time">
                            {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                          </span>
                        </div>
                        <p className={`conv-snippet ${unread > 0 ? 'unread-snippet' : ''}`}>
                          {conv.last_message ?? ''}
                        </p>
                        <div className="conv-bottom-row">
                          <p className="conv-user">{other?.full_name ?? 'Utilisateur'}</p>
                          {unread > 0 && <span className="unread-badge">{unread}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </aside>

        {/* ── Chat window ── */}
        {activeConv ? (
          <div className={`chat-window ${!showMobileChat ? 'mobile-hidden' : ''}`}>
            <div className="chat-header">
              <button className="mobile-only btn-back-chat" onClick={handleBack}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-info">
                <div
                  className="chat-avatar-sm"
                  style={{ background: activeOther ? getColor(activeOther.id) : '#ccc' }}
                >
                  {getInitial(activeOther?.full_name ?? null)}
                </div>
                <div>
                  <p className="chat-contact-name">{activeOther?.full_name ?? 'Utilisateur'}</p>
                  <p className="chat-listing-name">
                    {isListingDeleted ? 'Annonce supprimée' : (activeConv.listings?.title ?? '')}
                  </p>
                </div>
              </div>
              <button className="chat-more-btn">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="messages-feed" ref={feedRef}>
              {messages.length === 0 && (
                <div className="messages-feed-empty">
                  <p>Commencez la conversation !</p>
                </div>
              )}
              {getMessagesWithSeparators(messages).map((item, i) => {
                if (item.type === 'separator') {
                  return (
                    <div key={`sep-${i}`} className="date-separator">
                      {formatFullDate(item.date)}
                    </div>
                  );
                }
                const { msg } = item;
                const isMine = msg.sender_id === user.id;
                return (
                  <motion.div
                    key={msg.id}
                    className={`msg-row ${isMine ? 'msg-row-sent' : 'msg-row-received'}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {!isMine && (
                      <div
                        className="msg-avatar"
                        style={{ background: activeOther ? getColor(activeOther.id) : '#ccc' }}
                      >
                        {getInitial(activeOther?.full_name ?? null)}
                      </div>
                    )}
                    <div className={`msg-bubble ${isMine ? 'msg-bubble-sent' : 'msg-bubble-received'}`}>
                      <p className="msg-text">{msg.content}</p>
                      <span className="msg-time">{formatTime(msg.created_at)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!isListingDeleted ? (
              <div className="chat-input-container">
                <button className="btn-add-action" title="Envoyer une image">
                  <Image size={20} />
                </button>
                <button className="btn-add-action" title="Emoji">
                  <Smile size={20} />
                </button>
                <div className="input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Écrivez votre message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className={`btn-send-msg ${input.trim() ? 'active' : ''}`}
                    onClick={sendMessage}
                    disabled={!input.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="chat-deleted-notice">
                <p>Cette annonce a été supprimée. Vous ne pouvez plus envoyer de messages.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="chat-empty-state">
            <MessageCircle size={48} color="#ddd" />
            <p>Sélectionnez une conversation</p>
          </div>
        )}

        {/* ── Info sidebar (desktop) ── */}
        {activeConv && (
          <aside className="info-sidebar desktop-only">
            <div className="info-profile">
              <div className="profile-top">
                <div className="large-avatar" style={{ background: activeOther ? getColor(activeOther.id) : '#ccc' }}>
                  {getInitial(activeOther?.full_name ?? null)}
                </div>
                <button className="profile-dots">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <p className="profile-name">{activeOther?.full_name ?? 'Utilisateur'}</p>
              <div className="profile-status">
                <MessageCircle size={14} />
                <span>Membre</span>
              </div>
            </div>

            {!isListingDeleted && (
              <div className="info-listing">
                <p className="info-section-label">Annonce concernée</p>
                <div className="listing-small-card">
                  {getListingImage(activeConv) && (
                    <img src={getListingImage(activeConv)!} alt="" />
                  )}
                  <div className="small-card-info">
                    <p className="small-card-title">{activeConv.listings?.title ?? ''}</p>
                    {activeConv.listings?.price != null && (
                      <p className="small-card-price">
                        {activeConv.listings.price.toLocaleString('fr-FR')} €
                      </p>
                    )}
                  </div>
                </div>
                <button className="btn-mark-sold">
                  <Heart size={14} />
                  Marquer comme vendu
                </button>
              </div>
            )}

            <div className="info-actions">
              <button className="btn-report">Signaler</button>
              <button className="btn-block">Bloquer cet utilisateur</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
