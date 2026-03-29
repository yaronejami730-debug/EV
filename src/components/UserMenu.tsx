import { useState, useRef, useEffect } from 'react';
import { User, Heart, MessageCircle, PlusSquare, Settings, LogOut, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onOpenMessages: () => void;
  onCreateListing: () => void;
}

export default function UserMenu({ onOpenMessages, onCreateListing }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Moi';
  const initial = displayName[0].toUpperCase();

  const avatar = user?.user_metadata?.avatar_url;

  async function handleSignOut() {
    setOpen(false);
    await signOut();
  }

  return (
    <div className="user-menu-wrapper" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen(p => !p)}>
        <div className="user-avatar-sm">
          {avatar
            ? <img src={avatar} alt="" />
            : <span>{initial}</span>
          }
        </div>
        <span className="desktop-only user-name-short">{displayName.split(' ')[0]}</span>
        <ChevronDown size={14} className={`desktop-only chevron ${open ? 'rotated' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="user-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {/* Profile header */}
            <div className="dropdown-profile">
              <div className="dropdown-avatar">
                {avatar
                  ? <img src={avatar} alt="" />
                  : <span>{initial}</span>
                }
              </div>
              <div>
                <p className="dropdown-name">{displayName}</p>
                <p className="dropdown-email">{user?.email}</p>
                <div className="dropdown-rating">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span>Nouveau membre</span>
                </div>
              </div>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-section">
              <button className="dropdown-item" onClick={() => { setOpen(false); onCreateListing(); }}>
                <PlusSquare size={16} />
                <span>Déposer une annonce</span>
              </button>
              <button className="dropdown-item" onClick={() => { setOpen(false); }}>
                <User size={16} />
                <span>Mon profil</span>
              </button>
              <button className="dropdown-item" onClick={() => { setOpen(false); }}>
                <Heart size={16} />
                <span>Mes favoris</span>
              </button>
              <button className="dropdown-item" onClick={() => { setOpen(false); onOpenMessages(); }}>
                <MessageCircle size={16} />
                <span>Mes messages</span>
              </button>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-section">
              <button className="dropdown-item" onClick={() => setOpen(false)}>
                <Settings size={16} />
                <span>Paramètres</span>
              </button>
              <button className="dropdown-item danger" onClick={handleSignOut}>
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
