import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Heart, Share2, Flag, ChevronLeft, ChevronRight,
  MapPin, MessageCircle, CheckCircle, Truck, X,
  Star, Clock, Eye, TrendingDown, Copy, Check, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Listing {
  id: string;
  numericId: number;
  title: string;
  price: number;
  location_city: string;
  created_at: string;
  images: string[];
  category_slug: string;
  delivery: boolean;
  pro: boolean;
  description?: string;
  criteria?: Record<string, string>;
  seller: {
    id: string;
    full_name: string;
    is_verified: boolean;
    rating_avg: number;
    rating_count: number;
    location_city: string;
    member_since?: string;
  };
  views?: number;
}

interface Props {
  listing: Listing;
  onBack: () => void;
  onOpenMessages: () => void;
  onOpenAuth: () => void;
  onSelectListing: (listing: Listing) => void;
  isLoggedIn: boolean;
  similarListings?: Listing[];
  ads?: any[];
  onAdClick?: (ad: any) => void;
}


// ─── Lightbox ───────────────────────────────
function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: string[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="lightbox-close" onClick={onClose}><X size={24} /></button>
      <div className="lightbox-counter">{index + 1} / {images.length}</div>

      <button
        className="lightbox-arrow lightbox-prev"
        onClick={e => { e.stopPropagation(); onPrev(); }}
        disabled={index === 0}
      >
        <ChevronLeft size={28} />
      </button>

      <motion.img
        key={index}
        src={images[index]}
        alt=""
        className="lightbox-img"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
      />

      <button
        className="lightbox-arrow lightbox-next"
        onClick={e => { e.stopPropagation(); onNext(); }}
        disabled={index === images.length - 1}
      >
        <ChevronRight size={28} />
      </button>

      <div className="lightbox-thumbs" onClick={e => e.stopPropagation()}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className={`lightbox-thumb ${i === index ? 'active' : ''}`}
            onClick={() => { /* handled via index change from parent */ }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────
export default function ListingDetail({ listing, onBack, onOpenMessages, onOpenAuth, onSelectListing, isLoggedIn, similarListings = [], ads = [], onAdClick }: Props) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFav, setIsFav] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('lbc_favorites') || '[]');
    return favs.includes(listing.id);
  });
  const [copied, setCopied] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // ── Weighted ad rotation for sidebar ──
  const [sidebarAd, setSidebarAd] = useState<any | null>(null);

  useEffect(() => {
    function pickWeighted(pool: any[]) {
      const active = pool.filter(a => a.status === 'active');
      if (!active.length) return null;
      const total = active.reduce((s, a) => s + (a.weight || 1), 0);
      let r = Math.random() * total;
      for (const a of active) {
        r -= (a.weight || 1);
        if (r <= 0) return a;
      }
      return active[0];
    }
    const banners = ads.filter(a => a.type === 'banner');
    const pick = pickWeighted(banners);
    setSidebarAd(pick);
    const id = setInterval(() => setSidebarAd(pickWeighted(banners)), 12000);
    return () => clearInterval(id);
  }, [ads]);

  const images = listing.images ?? [listing.images];
  const shortDesc = listing.description
    ? listing.description.slice(0, 300)
    : `${listing.title} en excellent état. Disponible immédiatement sur ${listing.location_city}. Possibilité de discuter le prix dans la limite du raisonnable. N'hésitez pas à me contacter pour plus d'informations ou pour organiser une visite.`;
  const fullDesc = listing.description ?? shortDesc;
  const needsExpand = fullDesc.length > 300;

  // Sync URL
  useEffect(() => {
    window.history.pushState(null, '', `#/ad/${listing.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { window.history.pushState(null, '', '/'); };
  }, [listing.id]);

  const prevPhoto = useCallback(() => setActivePhoto(i => Math.max(0, i - 1)), []);
  const nextPhoto = useCallback(() => setActivePhoto(i => Math.min(images.length - 1, i + 1)), [images.length]);

  function toggleFav() {
    if (!isLoggedIn) { onOpenAuth(); return; }
    const favs: string[] = JSON.parse(localStorage.getItem('lbc_favorites') || '[]');
    const newFavs = isFav ? favs.filter(id => id !== listing.id) : [...favs, listing.id];
    localStorage.setItem('lbc_favorites', JSON.stringify(newFavs));
    setIsFav(!isFav);
  }

  async function handleShare() {
    const url = `${window.location.origin}/#/ad/${listing.id}`;
    if (navigator.share) {
      await navigator.share({ title: listing.title, text: `${listing.price.toLocaleString('fr-FR')} € — ${listing.title}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const criteria = listing.criteria ?? {};

  return (
    <div className="detail-page">
      {/* ── Breadcrumb ── */}
      <div className="detail-breadcrumb">
        <button className="breadcrumb-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Retour aux annonces</span>
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-cat">{listing.category_slug}</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-title">{listing.title}</span>
        <span className="breadcrumb-id desktop-only">Réf. {listing.numericId}</span>
      </div>

      <div className="detail-layout">
        {/* ── Left / Main ── */}
        <div className="detail-main">

          {/* Gallery */}
          <div className="gallery-container">
            {/* Main photo */}
            <div className="gallery-main-photo" onClick={() => setLightboxOpen(true)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activePhoto}
                  src={images[activePhoto]}
                  alt={listing.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={e => { e.stopPropagation(); prevPhoto(); }} disabled={activePhoto === 0}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="gallery-nav next" onClick={e => { e.stopPropagation(); nextPhoto(); }} disabled={activePhoto === images.length - 1}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="gallery-counter">
                <ZoomIn size={12} />
                {activePhoto + 1} / {images.length}
              </div>

              {/* Action buttons over photo */}
              <div className="gallery-overlay-actions">
                <button
                  className={`gallery-fav-btn ${isFav ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); toggleFav(); }}
                >
                  <motion.div animate={isFav ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                    <Heart size={20} fill={isFav ? 'white' : 'none'} />
                  </motion.div>
                </button>
                <button className="gallery-share-btn" onClick={e => { e.stopPropagation(); handleShare(); }}>
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${i === activePhoto ? 'active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                  >
                    <img src={img} alt="" />
                    {i === images.length - 1 && images.length >= 5 && (
                      <div className="thumb-more-overlay" onClick={() => setLightboxOpen(true)}>
                        <span>+{images.length - 4}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail card */}
          <div className="detail-content-card">

            {/* Title + price */}
            <div className="detail-top">
              <div className="detail-title-block">
                <h1 className="detail-title">{listing.title}</h1>
                <div className="detail-meta-row">
                  {listing.pro && <span className="badge-pro">Pro</span>}
                  <span className="detail-meta-item">
                    <MapPin size={13} />{listing.location_city}
                  </span>
                  <span className="detail-meta-item">
                    <Clock size={13} />{listing.created_at}
                  </span>
                  {listing.views && (
                    <span className="detail-meta-item">
                      <Eye size={13} />{listing.views.toLocaleString('fr-FR')} vues
                    </span>
                  )}
                </div>
                <p className="detail-ref desktop-only">Réf. annonce : <strong>#{listing.numericId}</strong></p>
              </div>

              <div className="detail-price-block">
                <p className="detail-price">{listing.price.toLocaleString('fr-FR')} €</p>
                {listing.price > 5000 && (
                  <p className="detail-monthly">
                    <TrendingDown size={14} color="#00A699" />
                    dès {Math.round(listing.price / 60).toLocaleString('fr-FR')} €/mois
                  </p>
                )}
              </div>
            </div>

            {/* Criteria */}
            {Object.keys(criteria).length > 0 && (
              <>
                <div className="detail-divider" />
                <div className="detail-section">
                  <h3 className="detail-section-title">Critères</h3>
                  <div className="criteria-chips">
                    {Object.entries(criteria).map(([k, v]) => (
                      <div key={k} className="criteria-chip">
                        <span className="chip-label">{k}</span>
                        <span className="chip-value">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            <div className="detail-divider" />
            <div className="detail-section">
              <h3 className="detail-section-title">Description</h3>
              <div className="detail-description">
                <p>{descExpanded || !needsExpand ? fullDesc : shortDesc + '…'}</p>
                {needsExpand && (
                  <button className="btn-expand-desc" onClick={() => setDescExpanded(p => !p)}>
                    {descExpanded ? 'Voir moins' : 'Voir la description complète'}
                  </button>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="detail-divider" />
            <div className="detail-section">
              <h3 className="detail-section-title">Localisation</h3>
              <div className="location-chip">
                <MapPin size={18} color="var(--primary)" />
                <span>{listing.location_city}</span>
              </div>
            </div>

            {/* Actions bottom (mobile) */}
            <div className="detail-bottom-actions mobile-only">
              <button className={`btn-fav-lg ${isFav ? 'active' : ''}`} onClick={toggleFav}>
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <button className="btn-message-lg" onClick={isLoggedIn ? onOpenMessages : onOpenAuth}>
                <MessageCircle size={18} />
                Contacter
              </button>
              <button className="btn-share-lg" onClick={handleShare}>
                {copied ? <Check size={18} /> : <Share2 size={18} />}
              </button>
            </div>
          </div>

          {/* Similar listings */}
          {similarListings.length > 0 && (
            <div className="similar-section">
              <h3 className="similar-title">Annonces similaires</h3>
              <div className="similar-grid">
                {similarListings.map(s => (
                  <div key={s.id} className="similar-card" onClick={() => { onSelectListing(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <img src={s.images[0]} alt={s.title} />
                    <p className="similar-name">{s.title}</p>
                    <p className="similar-price">{s.price.toLocaleString('fr-FR')} €</p>
                    <p className="similar-loc">{s.location_city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="detail-sidebar">
          {/* Seller card */}
          <div className="sidebar-card">
            <div className="seller-header">
              <div className="seller-avatar-circle">
                {listing.seller.full_name[0]}
              </div>
              <div>
                <p className="seller-name">{listing.seller.full_name}</p>
                {listing.seller.is_verified && (
                  <div className="seller-verified">
                    <CheckCircle size={13} color="#00A699" />
                    <span>Identité vérifiée</span>
                  </div>
                )}
                <div className="seller-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < Math.round(listing.seller.rating_avg) ? '#F59E0B' : 'none'}
                      color="#F59E0B"
                    />
                  ))}
                  <span>{listing.seller.rating_avg.toFixed(1)} ({listing.seller.rating_count} avis)</span>
                </div>
                {listing.seller.member_since && (
                  <p className="seller-since">Membre depuis {listing.seller.member_since}</p>
                )}
              </div>
            </div>

            <button
              className="btn-message-sidebar"
              onClick={isLoggedIn ? onOpenMessages : onOpenAuth}
            >
              <MessageCircle size={18} />
              Envoyer un message
            </button>
            <button className="btn-offer-sidebar">
              Faire une offre
            </button>
          </div>

          {/* Buy card */}
          <div className="sidebar-card buy-card-sticky">
            <p className="buy-price">{listing.price.toLocaleString('fr-FR')} €</p>
            {listing.delivery && (
              <div className="delivery-row">
                <Truck size={15} color="#00A699" />
                <span>Livraison disponible</span>
              </div>
            )}
            <button className="btn-buy">Acheter</button>
            <div className="secure-row">
              <CheckCircle size={14} color="#00A699" />
              <span>Paiement sécurisé leboncoin</span>
            </div>
          </div>

          {/* Actions */}
          <div className="sidebar-actions-card">
            <button
              className={`sidebar-action-btn fav ${isFav ? 'active' : ''}`}
              onClick={toggleFav}
            >
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
            <button className="sidebar-action-btn share" onClick={handleShare}>
              {copied ? <Copy size={16} /> : <Share2 size={16} />}
              {copied ? 'Lien copié !' : 'Partager'}
            </button>
            <button className="sidebar-action-btn report">
              <Flag size={16} />
              Signaler
            </button>
          </div>

          {/* Ad Slot — rotating weighted banner */}
          <div className="sidebar-ad-card">
            <div className="sidebar-ad-header">
              <span className="promoted-tag-mini">Sponsorisé</span>
            </div>
            {sidebarAd ? (
              <button
                className="sidebar-ad-content sidebar-ad-btn"
                onClick={() => onAdClick?.(sidebarAd)}
              >
                <div className="sidebar-ad-img">
                  <img src={sidebarAd.imageUrl} alt={sidebarAd.name} />
                </div>
                <div className="sidebar-ad-text">
                  <p className="sidebar-ad-name">{sidebarAd.name}</p>
                  <p className="sidebar-ad-tagline">{sidebarAd.tagline || 'Partenaire'}</p>
                </div>
              </button>
            ) : (
              <div className="skyscraper-placeholder-mini" style={{ height: '140px' }}>Publicité</div>
            )}
          </div>

          {/* ID */}
          <p className="listing-id-ref">Réf. annonce : <strong>#{listing.numericId}</strong></p>
        </aside>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            index={activePhoto}
            onClose={() => setLightboxOpen(false)}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            className="share-toast"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
          >
            <Check size={16} /> Lien copié dans le presse-papiers
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
