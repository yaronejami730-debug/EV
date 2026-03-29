import { useState, useEffect } from 'react';
import {
  Search,
  Search as SearchIcon,
  X,
  Plus,
  MapPin,
  Heart,
  PlusSquare,
  User,
  MessageCircle,
  Bell,
  MoreHorizontal,
  Menu,
  Car,
  Camera,
  Watch,
  Gamepad,
  Coffee,
  Truck,
  TrendingUp,
  ChevronDown,
  Star
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import MessagingView from './components/MessagingView';
import CreateListingModal from './components/CreateListingModal';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import ListingDetail from './components/ListingDetail';
import AdminPortal from './components/AdminPortal';
import { useAuth } from './hooks/useAuth';
import './App.css';



// Mock Data
const CATEGORIES = [
  { id: 'all', name: 'Toutes les catégories', icon: MoreHorizontal, slug: 'all' },
  { id: '2', name: 'Véhicules', icon: Car, slug: 'auto' },
  { id: '3', name: 'Multimédia', icon: Camera, slug: 'tech' },
  { id: '4', name: 'Mode', icon: Watch, slug: 'fashion' },
  { id: '5', name: 'Loisirs', icon: Gamepad, slug: 'recreation' },
  { id: '6', name: 'Maison', icon: Coffee, slug: 'home' },
];

interface Ad {
  id: string;
  name: string;
  type: 'skyscrapper' | 'promoted' | 'banner';
  status: 'active' | 'paused' | 'ended';
  views: number;
  clicks: number;
  ctr: string;
  imageUrl: string;
  startDate: string;
  description?: string;
  tagline?: string;
  url?: string;
  weight: number; // For prioritization (budget-based)
}





const LISTINGS: any[] = [
  {
    id: 'l1',
    title: 'BMW Série 3 - 320d M Sport',
    price: 32500,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    location_city: 'Bordeaux (33000)',
    created_at: 'Hier, 18:45',
    category_slug: 'auto',
    description: 'Magnifique BMW Série 3 en excellent état. Full options, pack M Sport, entretien exclusif BMW. Faible kilométrage. Disponible immédiatement.',
    delivery: false,
    pro: true,
    seller: { full_name: 'Garage Prestige 33', rating_avg: 4.8, avatar_url: null }
  },
  {
    id: 'l2',
    title: 'Sculpture The Mandalorian - Edition Limitée',
    price: 450,
    image: 'https://images.unsplash.com/photo-1623939012339-5b3fc9bb8c5c?auto=format&fit=crop&q=80&w=800',
    location_city: 'Lyon (69002)',

    created_at: 'Aujourd\'hui, 10:20',
    category_slug: 'recreation',
    description: 'Pièce de collection rare. Sculpture détaillée de Din Djarin avec Grogu. Parfait état, carton d\'origine fourni.',
    delivery: true,
    pro: false,
    seller: { full_name: 'Lucas G.', rating_avg: 5.0, avatar_url: 'https://i.pravatar.cc/150?u=lucas' }
  },
  {
    id: 'l3',
    title: 'Appartement T3 - Vue Mer',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    location_city: 'Marseille (13007)',
    created_at: 'Il y a 2h',
    category_slug: 'realestate',
    description: 'Superbe T3 traversant avec vue imprenable sur le Vieux-Port. Entièrement rénové, cuisine équipée, balcon.',
    delivery: false,
    pro: true,
    seller: { full_name: 'Immo Provence', rating_avg: 4.5, avatar_url: null }
  },
  {
    id: 'l4',
    title: 'MacBook Pro M3 Max - 32Go RAM',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    location_city: 'Paris (75015)',
    created_at: 'Hier, 14:12',
    category_slug: 'tech',
    description: 'Dernière génération de MacBook Pro. Performance extrême pour montage vidéo et 3D. Comme neuf, sous garantie.',
    delivery: true,
    pro: false,
    seller: { full_name: 'Sarah M.', rating_avg: 4.9, avatar_url: 'https://i.pravatar.cc/150?u=sarah' }
  },
  {
    id: 'l5',
    title: 'Canapé Design velours vert',
    price: 600,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    location_city: 'Nantes (44000)',
    created_at: 'Il y a 5h',
    category_slug: 'home',
    description: 'Canapé 3 places très confortable. Velours de haute qualité, style moderne. Très peu servi.',
    delivery: false,
    pro: false,
    seller: { full_name: 'Julie D.', rating_avg: 4.7, avatar_url: 'https://i.pravatar.cc/150?u=julie' }
  },
  {
    id: 'l6',
    title: 'Rolex Submariner Date',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800',
    location_city: 'Cannes (06400)',
    created_at: 'Hier, 09:30',
    category_slug: 'fashion',
    description: 'Montre iconique, full set (boîte et papiers). État exceptionnel. Expertise possible en boutique.',
    delivery: false,
    pro: true,
    seller: { full_name: 'Luxe Horlogerie', rating_avg: 4.9, avatar_url: null }
  },
  {
    id: 'l7',
    title: 'Lot de vêtements, taille L à la taille XXL',
    price: 200,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    location_city: 'Paris (75019)',


    created_at: '20 mars 2026',
    category_slug: 'fashion',
    description: '📌 Description détaillée\n🛍️ Contenu : Ballot de vêtements pour homme, principalement des t-shirts.\n📏 Tailles : De L à XXL\n🎨 Couleurs : Variées\n✨ État : Bon état général, certains articles quasi neufs.\n\n💵 Prix attractif : 200€ seulement pour un lot conséquent !\n\n🚚 Expédition : Possibilité d\'envoi rapide ou remise en main propre selon votre localisation.',
    delivery: true,
    pro: false,
    seller: { full_name: 'Yaron J.', rating_avg: 4.9, avatar_url: 'https://i.pravatar.cc/150?u=yaron' }
  }
];

const DEFAULT_ADS: any[] = [
  {
     id: 'ad1',
     name: 'Promo Été 2026',
     type: 'skyscrapper',
     status: 'active',
     views: 1240,
     clicks: 85,
     ctr: '6.8%',
     imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=1000&auto=format',
     startDate: '01/03/2026',
     url: 'https://google.com'
  },
  {
     id: 'ad2',
     name: 'Nouveau Samsung S25',
     type: 'skyscrapper',
     status: 'active',
     views: 890,
     clicks: 42,
     ctr: '4.7%',
     imageUrl: 'https://images.unsplash.com/photo-1533481235975-f92a40e15916?w=600&h=1000&auto=format',
     startDate: '15/03/2026',
     url: 'https://samsung.com'
  },
  {
     id: 'ad3',
     name: 'Lancez-vous avec Shine',
     type: 'banner',
     status: 'active',
     views: 4500,
     clicks: 310,
     ctr: '6.9%',
     imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=800&h=400&auto=format',
     startDate: '20/03/2026',
     description: 'Nos conseillers vous accompagnent de A à Z dans votre projet de création d’Entreprise',
     tagline: 'Shine',
     url: 'https://shine.fr',
     weight: 10 // High priority
  },
  {
     id: 'ad4',
     name: 'Nike Air Max 2026',
     type: 'promoted',
     status: 'active',
     views: 1560,
     clicks: 92,
     ctr: '5.9%',
     imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&auto=format',
     startDate: '22/03/2026',
     url: 'https://nike.com',
     weight: 5 // Medium priority
  }
];








function App() {
  const { user, loading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListings, setMyListings] = useState([LISTINGS[6], ...LISTINGS.slice(0, 3)]);
  const [showCreateModal, setShowCreateModal] = useState(false);



  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(
    () => window.location.hash === '#admin'
  );

  useEffect(() => {
    const handler = () => {
      setIsAdminOpen(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  function openAdmin() {
    window.location.hash = 'admin';
    setIsAdminOpen(true);
  }

  function closeAdmin() {
    window.location.hash = '';
    setIsAdminOpen(false);
  }
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [ads, setAds] = useState<Ad[]>(() => {
    try {
      const stored = localStorage.getItem('app_ads');
      if (stored) {
         const parsed = JSON.parse(stored);
         if (parsed.length < DEFAULT_ADS.length) return DEFAULT_ADS.map(a => ({ ...a, weight: a.weight || 1 }));
         return parsed;
      }
      return DEFAULT_ADS;
    } catch { return DEFAULT_ADS; }
  });

  // Weighted Selection Utility
  const getWeightedAd = (type: 'skyscrapper' | 'promoted' | 'banner', currentAds: Ad[]) => {
    const filtered = currentAds.filter(a => a.type === type && a.status === 'active');
    if (filtered.length === 0) return null;
    
    const totalWeight = filtered.reduce((acc, ad) => acc + (ad.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const ad of filtered) {
       if (random < (ad.weight || 1)) return ad;
       random -= (ad.weight || 1);
    }
    return filtered[0];
  };

  // Tracking functions — update views/clicks/CTR in real time
  const trackAdImpression = (adId: string) => {
    setAds(prev => prev.map(ad => {
      if (ad.id !== adId) return ad;
      const views = ad.views + 1;
      const ctr = views > 0 ? `${((ad.clicks / views) * 100).toFixed(1)}%` : '0%';
      return { ...ad, views, ctr };
    }));
  };

  const trackAdClick = (ad: Ad) => {
    setAds(prev => prev.map(a => {
      if (a.id !== ad.id) return a;
      const clicks = a.clicks + 1;
      const ctr = a.views > 0 ? `${((clicks / a.views) * 100).toFixed(1)}%` : '0%';
      return { ...a, clicks, ctr };
    }));
    if (ad.url && ad.url !== '#') {
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Rotation State (IDs of currently displayed ads)
  const [activeSkyLeft, setActiveSkyLeft] = useState<Ad | null>(null);
  const [activeSkyRight, setActiveSkyRight] = useState<Ad | null>(null);
  const [activeFeedBanner, setActiveFeedBanner] = useState<Ad | null>(null);

  // Initial & Periodic Rotation + impression tracking
  useEffect(() => {
    const rotate = () => {
      const left = getWeightedAd('skyscrapper', ads);
      const right = getWeightedAd('skyscrapper', ads);
      const banner = getWeightedAd('banner', ads);
      setActiveSkyLeft(left);
      setActiveSkyRight(right);
      setActiveFeedBanner(banner);
      if (left) trackAdImpression(left.id);
      if (right && right.id !== left?.id) trackAdImpression(right.id);
      if (banner) trackAdImpression(banner.id);
    };

    rotate();
    const interval = setInterval(rotate, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Page Title Update
  useEffect(() => {
    if (selectedListing) {
      document.title = `${selectedListing.title} | Entre Voisins`;
    } else if (showMessages) {
      document.title = 'Messages | Entre Voisins';
    } else {
      document.title = 'Accueil | Entre Voisins';
    }
  }, [selectedListing, showMessages]);


  useEffect(() => {
    localStorage.setItem('app_ads', JSON.stringify(ads));
  }, [ads]);

  const [titleOnly, setTitleOnly] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch { return []; }
  });

  const [viewedListings, setViewedListings] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('viewed_listings');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch { return new Set(); }
  });

  const CATEGORY_MAP: Record<string, string> = {
    'auto': 'Voitures',
    'realestate': 'Immobilier',
    'tech': 'Multimédia',
    'home': 'Maison & Jardin',
    'fashion': 'Mode',
    'recreation': 'Loisirs',
    'services': 'Services',
    'jobs': 'Emploi',
    'animals': 'Animaux',
    'other': 'Autres'
  };

  function openListing(listing: any) {
    setSelectedListing(listing);
    const updated = new Set(viewedListings).add(listing.id);
    setViewedListings(updated);
    try {
      localStorage.setItem('viewed_listings', JSON.stringify([...updated]));
    } catch { /* ignore */ }
  }

  const filteredListings = LISTINGS.filter(listing => {
    const query = searchQuery.toLowerCase();
    const loc = location.toLowerCase();
    
    const matchesCategory = activeCategory === 'all' || listing.category_slug === activeCategory;
    
    const matchesSearch = titleOnly 
      ? listing.title.toLowerCase().includes(query)
      : (listing.title.toLowerCase().includes(query) || 
         (listing.description && listing.description.toLowerCase().includes(query)) ||
         (listing.seller && listing.seller.full_name.toLowerCase().includes(query)));

    const matchesLocation = 
      !location || 
      listing.location_city.toLowerCase().includes(loc);

    return matchesCategory && matchesSearch && matchesLocation;
  });

  const addToRecent = (q: string) => {
    if (!q.trim()) return;
    const next = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem('recent_searches', JSON.stringify(next));
  };

  const removeRecent = (q: string) => {
     const next = recentSearches.filter(s => s !== q);
     setRecentSearches(next);
     localStorage.setItem('recent_searches', JSON.stringify(next));
  };

  return (
    <div className="app">
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="admin-overlay"
          >
            <AdminPortal 
              onClose={closeAdmin} 
              ads={ads}
              setAds={setAds}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Banners (Live Skyscrapers) - Show on all views except Detail and Messaging */}
      {!selectedListing && !showMessages && (
        <>
          <div className="side-banner side-banner-left desktop-only">
            {activeSkyLeft ? (
              <div className="sky-ad-wrap">
                <span className="sky-ad-label">Sponsorisé</span>
                <button className="sky-ad-btn" onClick={() => trackAdClick(activeSkyLeft)}>
                  <img src={activeSkyLeft.imageUrl} alt={activeSkyLeft.name} className="ad-img-full" />
                </button>
              </div>
            ) : (
              <div className="skyscraper-placeholder-mini">Publicité</div>
            )}
          </div>
          <div className="side-banner side-banner-right desktop-only">
            {activeSkyRight ? (
              <div className="sky-ad-wrap">
                <span className="sky-ad-label">Sponsorisé</span>
                <button className="sky-ad-btn" onClick={() => trackAdClick(activeSkyRight)}>
                  <img src={activeSkyRight.imageUrl} alt={activeSkyRight.name} className="ad-img-full" />
                </button>
              </div>
            ) : (
              <div className="skyscraper-placeholder-mini">Publicité</div>
            )}
          </div>
        </>
      )}


      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="menu-btn mobile-only">
            <Menu size={24} />
          </button>
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); setSelectedListing(null); setShowMessages(false); setShowMyListings(false); }}>
            Entre Voisins
          </a>
          <nav className="header-main-nav desktop-only">
            <button 
              className={`nav-link-main ${!selectedListing && !showMessages && !showMyListings ? 'active' : ''}`}
              onClick={() => { setSelectedListing(null); setShowMessages(false); setShowMyListings(false); }}
            >
              Accueil
            </button>
          </nav>

          {!showMessages && (
            <button className="btn-post desktop-only" onClick={() => setShowCreateModal(true)}>
              <PlusSquare size={18} />
              <span>Déposer une annonce</span>
            </button>
          )}
        </div>

        <div className="header-center desktop-only">
          {!selectedListing && !showMessages && (
            <div className="header-search">
              <Search size={18} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Rechercher chez vos voisins" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {showMessages && (
            <div className="messages-nav-tabs desktop-only">
              <span>Immobilier</span>
              <span>Véhicules</span>
              <span>Vacances</span>
              <span>Emploi</span>
              <span className="active-nav">Bons plans !</span>
            </div>
          )}
        </div>

        <div className="header-right">
          {user && (
            <>
              <button className="nav-icon-btn">
                <Bell size={24} />
                <span className="desktop-only">Mes recherches</span>
              </button>
              <button className="nav-icon-btn">
                <Heart size={24} />
                <span className="desktop-only">Favoris</span>
              </button>
              <button 
                className={`nav-icon-btn ${showMessages ? 'active-link' : ''}`}
                onClick={() => { setShowMessages(true); setSelectedListing(null); }}
              >
                <MessageCircle size={24} />
                <span className="desktop-only">Messages</span>
              </button>
            </>
          )}
          {!loading && (
            user
              ? <UserMenu
                  onOpenMessages={() => { setShowMessages(true); setSelectedListing(null); setShowMyListings(false); }}
                  onOpenMyListings={() => { setShowMyListings(true); setShowMessages(false); setSelectedListing(null); }}
                  onCreateListing={() => setShowCreateModal(true)}
                />
              : <button className="nav-icon-btn" onClick={() => setShowAuthModal(true)}>

                  <User size={24} />
                  <span className="desktop-only">Se connecter</span>
                </button>
          )}
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {showMessages ? (
            <motion.div
              key="messages-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessagingView onBack={() => setShowMessages(false)} />
            </motion.div>
          ) : showMyListings ? (
            <motion.div
              key="my-listings-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="container" style={{ paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button className="btn-icon-circular" onClick={() => setShowMyListings(false)}>
                    <X size={20} />
                  </button>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Mes annonces</h2>
                </div>

                <div className="my-listings-tabs">
                  <button className="my-listings-tab active">En ligne ({myListings.length})</button>
                  <button className="my-listings-tab">Expirées (0)</button>
                </div>
                
                <div className="my-listings-filters">
                   <div className="filter-search-group">
                      <div className="filter-search-input">
                        <Search size={18} />
                        <input type="text" placeholder="Recherchez dans vos annonces" />
                      </div>
                      <div className="filter-dropdown">
                        <Menu size={16} />
                        <span>Catégories</span>
                        <ChevronDown size={14} />
                      </div>
                      <button className="btn-search-ads">Rechercher</button>
                   </div>
                   <div className="filter-sort">
                      <span>Trier par:</span>
                      <div className="sort-dropdown">
                        <span>Date</span>
                        <ChevronDown size={14} />
                      </div>
                   </div>
                </div>

                <div className="bulk-actions-row">
                   <div className="bulk-item disabled"><TrendingUp size={16} /> Remontez votre annonce</div>
                   <div className="bulk-item disabled"><Star size={16} /> À la une</div>
                   <div className="bulk-item disabled"><Watch size={16} /> Logo Urgent</div>
                   <div className="bulk-item disabled"><Coffee size={16} /> Pause</div>
                   <div className="bulk-item disabled"><Truck size={16} /> Réactiver</div>
                   <div className="bulk-item disabled"><X size={16} /> Supprimer</div>
                </div>
                
                <div className="my-listings-list">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="my-listing-horizontal-card">
                       <div className="my-listing-checkbox">
                          <div className="custom-checkbox" />
                       </div>
                       <div className="my-listing-main" onClick={() => openListing(listing)} style={{ cursor: 'pointer' }}>

                          <div className="my-listing-image">
                             <img src={listing.image} alt={listing.title} />
                          </div>
                          <div className="my-listing-details">
                             <h4 className="my-listing-title">{listing.title}</h4>
                             <div className="my-listing-price-row">
                                <span className="my-listing-price">{listing.price.toLocaleString('fr-FR')} €</span>
                                {listing.delivery && <span className="delivery-badge-mini">Livraison</span>}
                             </div>
                             <p className="my-listing-meta-text">{CATEGORY_MAP[listing.category_slug]} • Créée le {listing.created_at}</p>
                             
                             <div className="my-listing-actions-detailed">
                                <button className="btn-boost">Vendez plus vite</button>
                                <button className="btn-action-outline">Mettre en pause</button>
                                <button className="btn-action-outline">Modifier gratuitement</button>
                                <button className="btn-icon-delete" onClick={() => setMyListings(prev => prev.filter(l => l.id !== listing.id))}>
                                   <X size={18} />
                                </button>
                             </div>
                          </div>
                          <div className="my-listing-stats-sidebar">
                             <div className="stat-item">
                                <Search size={14} />
                                <span>604</span>
                             </div>
                             <div className="stat-item">
                                <Heart size={14} />
                                <span>11</span>
                             </div>
                             <div className="stat-item">
                                <MessageCircle size={14} />
                                <span>16</span>
                             </div>
                             <div className="stat-performance-header">
                                <span>Performance</span>
                                <ChevronDown size={14} />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                  <div className="create-listing-card-placeholder" onClick={() => setShowCreateModal(true)} style={{ marginTop: '2rem' }}>
                    <PlusSquare size={48} color="var(--primary)" />
                    <p>Déposer une nouvelle annonce</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !selectedListing ? (
            <motion.div 
              key="list-view"

// ... (rest of the list view code)
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Search Section */}
              <section className="hero">
                <div className="container hero-content">
                  <h1 className="hero-title">Des millions de petites annonces au bon prix</h1>
                  
                  <div className="search-container">
                    <div className="search-field">
                      <Search size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        placeholder="Chercher un objet, un service..." 
                        value={searchQuery}
                        onFocus={() => setShowSearchSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addToRecent(searchQuery)}
                      />
                      
                      <AnimatePresence>
                        {showSearchSuggestions && (
                          <motion.div 
                            className="search-suggestions-dropdown"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <label className="suggestion-filter-row" onClick={(e) => e.stopPropagation()}>
                              <div className={`custom-checkbox ${titleOnly ? 'checked' : ''}`} onClick={() => setTitleOnly(!titleOnly)}>
                                {titleOnly && <Plus size={14} style={{ transform: 'rotate(45deg)' }} />}
                              </div>
                              <span>Recherche dans le titre uniquement</span>
                            </label>

                            <div className="suggestion-divider" />

                            {recentSearches.length > 0 && !searchQuery && (
                              <section className="suggestion-section">
                                <h6>Recherches récentes</h6>
                                {recentSearches.map(s => (
                                  <div key={s} className="suggestion-item">
                                    <div className="suggestion-item-left" onClick={() => { setSearchQuery(s); addToRecent(s); }}>
                                      <TrendingUp size={16} color="#aaa" />
                                      <span>{s}</span>
                                    </div>
                                    <button className="remove-suggestion" onClick={() => removeRecent(s)}><X size={14} /></button>
                                  </div>
                                ))}
                              </section>
                            )}

                            {searchQuery && (
                              <section className="suggestion-section">
                                <h6>Suggestions</h6>
                                {Object.entries(CATEGORY_MAP).slice(0, 4).map(([slug, name]) => (
                                  <div key={slug} className="suggestion-item" onClick={() => { setActiveCategory(slug); addToRecent(searchQuery); }}>
                                    <div className="suggestion-item-left">
                                      <SearchIcon size={16} color="#aaa" />
                                      <span>{searchQuery} dans <strong style={{ color: 'var(--accent)' }}>{name}</strong></span>
                                    </div>
                                  </div>
                                ))}
                                <div className="suggestion-item" onClick={() => addToRecent(searchQuery)}>
                                  <div className="suggestion-item-left">
                                    <SearchIcon size={16} color="#aaa" />
                                    <span><strong>{searchQuery}</strong> dans toute la France</span>
                                  </div>
                                </div>
                              </section>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="search-field">
                      <MapPin size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        placeholder="Saisissez une ville ou un code postal" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <button className="btn-search-main">
                      <Search size={24} />
                    </button>
                  </div>

                  {/* Category Icons Bar */}
                  <div className="category-bar">
                    {CATEGORIES.map((cat) => (
                      <div 
                        key={cat.id} 
                        className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        <div className="cat-icon-wrapper">
                          <cat.icon size={24} />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

               {/* Advertisers / Promoted Section (Weighted Selection) */}
               {ads.some(a => a.type === 'promoted' && a.status === 'active') && (
                 <section className="container ads-container">
                   <div className="promoted-header">
                     <span className="promoted-tag">Sponsorisé Nom de la Campagne</span>
                   </div>
                   <div className="promoted-grid">
                     {/* Show up to 4 rotated promoted ads */}
                     {Array.from({ length: Math.min(4, ads.filter(a => a.type === 'promoted' && a.status === 'active').length) }).map((_, i) => {
                       const ad = getWeightedAd('promoted', ads);
                       if (!ad) return null;
                       return (
                         <a key={`${ad.id}-${i}`} href={ad.url || "#"} target="_blank" rel="noopener noreferrer" className="promoted-card-mini">
                           <div className="promoted-img-wrapper">
                              <img src={ad.imageUrl} alt={ad.name} className="ad-img-full" />
                           </div>
                           <p>{ad.name}</p>
                           <span className="promoted-link">sponsorisé</span>
                         </a>
                       );
                     })}
                   </div>
                 </section>
               )}

              {/* Feed Banners (Banner type ads, matching leboncoin mobile feed) */}
              {activeFeedBanner && (
                <section className="container sponsored-banners-section">
                  <a href={activeFeedBanner.url || "#"} target="_blank" rel="noopener noreferrer" className="promoted-banner-feed-link">
                    <div className="promoted-banner-feed">
                      <div className="promoted-banner-content">
                        <div className="ad-mini-logo">
                          {activeFeedBanner.tagline?.charAt(0) || 'A'}
                        </div>
                        <div className="promoted-banner-main">
                           <h4>{activeFeedBanner.name}</h4>
                           <p className="ad-description-mini">{activeFeedBanner.description}</p>
                           <span className="promoted-banner-tag-text">{activeFeedBanner.tagline || 'Sponsorisé'}</span>
                        </div>
                        <button className="btn-banner-open">
                          Ouvrir <span>›</span>
                        </button>
                      </div>
                    </div>
                  </a>
                </section>
              )}


              {/* Sell Banner */}
              <section className="container sell-banner-section">
                <div className="sell-banner-card">
                   <div className="sell-banner-text">
                      <h3>C'est le moment de vendre</h3>
                      <button className="btn-post-lg" onClick={() => setShowCreateModal(true)}>
                        <PlusSquare size={20} />
                        Déposer une annonce
                      </button>
                   </div>
                   <div className="sell-banner-decor-left" />
                   <div className="sell-banner-decor-right" />
                </div>
              </section>

              {/* Listings Section */}
              <div className="container">
                  <h2 className="section-title">
                    {searchQuery || location 
                      ? `${filteredListings.length} résultats pour votre recherche` 
                      : "En ce moment entre voisins"}
                  </h2>

                <div className="listings-grid">
                  <AnimatePresence mode='popLayout'>
                    {filteredListings.length > 0 ? (
                      filteredListings.map((listing, index) => (
                        <motion.div 
                          layout
                          key={listing.id}
                          className="listing-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => openListing(listing)}
                        >
                          <div className="listing-image-container">
                            <img src={listing.image} alt={listing.title} className="listing-image" />
                            {viewedListings.has(listing.id) && (
                              <span className="badge-seen">Déjà vu</span>
                            )}
                            <button className="btn-fav" onClick={(e) => e.stopPropagation()}>
                              <Heart size={20} />
                            </button>
                          </div>
                          <div className="listing-body">
                            <p className="listing-name">{listing.title}</p>
                            <p className="listing-price">{listing.price.toLocaleString('fr-FR')} €</p>
                            
                            <div className="listing-meta">
                              {listing.pro && <span className="badge-pro">Pro</span>}
                              {listing.delivery && (
                                <div className="delivery-info">
                                  <Truck size={12} />
                                  <span>Livraison disponible</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="listing-footer">
                            <span>{listing.location_city}</span>
                            <span>{listing.created_at}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="empty-results"
                      >
                        <Search size={48} color="#ccc" />
                        <p>Oups ! Aucun résultat à proximité pour cette recherche.</p>
                        <button className="btn-reset-search" onClick={() => { setSearchQuery(''); setLocation(''); setActiveCategory('all'); }}>
                          Effacer les filtres
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <MegaFooter />
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ListingDetail
                listing={selectedListing}
                onBack={() => setSelectedListing(null)}
                onOpenMessages={() => { setShowMessages(true); setSelectedListing(null); }}
                onOpenAuth={() => setShowAuthModal(true)}
                onSelectListing={(l) => setSelectedListing(l)}
                isLoggedIn={!!user}
                  similarListings={LISTINGS.filter(l => 
                    l.id !== selectedListing.id && 
                    l.category_slug === selectedListing.category_slug
                  )}
                  ads={ads}
                  onAdClick={trackAdClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateListingModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>À PROPOS D'ENTRE VOISINS</h4>
              <ul>
                <li>Qui sommes-nous ?</li>
                <li>Nous rejoindre</li>
                <li>Impact environnemental</li>
                <li>L'Avenir a du bon</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>NOS SOLUTIONS PROS</h4>
              <ul>
                <li>Publicité</li>
                <li>Vos recrutements</li>
                <li>Espace Sourcings</li>
                <li>Immobilier</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>INFORMATIONS LÉGALES</h4>
              <ul>
                <li>Conditions générales d'utilisation</li>
                <li>Conditions générales de vente</li>
                <li>Vie privée / cookies</li>
                <li>Avis clients</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>DES QUESTIONS ?</h4>
              <ul>
                <li>Aide</li>
                <li onClick={openAdmin} className="admin-access-link">Portail Admin (Publicité)</li>
                <li>Le service de paiement sécurisé</li>
                <li>Le porte-monnaie</li>
                <li>Le service de livraison</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>Entre Voisins 2006 - 2026</p>
            <div className="footer-links">
              <span>Français</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MegaFooter() {
  const categories = [
    { title: 'EMPLOI', items: ["Offres d'emploi", 'Formations professionnelles'] },
    { title: 'VÉHICULES', items: ['Voitures', 'Motos', 'Caravaning', 'Utilitaires', 'Camions', 'Nautisme', 'Équipement auto', 'Équipement moto', 'Équipement caravaning', 'Équipement nautisme'] },
    { title: 'IMMOBILIER', items: ['Ventes immobilières', 'Locations', 'Colocations', 'Bureaux & Commerces'] },
    { title: 'MODE', items: ['Vêtements', 'Chaussures', 'Accessoires & Bagagerie', 'Montres & Bijoux'] },
    { title: 'LOCATIONS DE VACANCES', items: ['Locations saisonnières'] },
    { title: 'LOISIRS', items: ['Antiquités', 'Collection', 'CD - Musique', 'DVD - Films', 'Instruments de musique', 'Livres', 'Modélisme', 'Vins & Gastronomie', 'Jeux & Jouets', 'Loisirs créatifs', 'Sport & Plein air', 'Vélos', 'Équipements vélos'] },
    { title: 'ANIMAUX', items: ['Animaux', 'Accessoires animaux', 'Animaux perdus'] },
    { title: 'ÉLECTRONIQUE', items: ['Ordinateurs', 'Accessoires informatique', 'Tablettes & Liseuses', 'Photo, audio & vidéo', 'Téléphones & Objets connectés', 'Accessoires téléphone & Objets connectés', 'Consoles', 'Jeux vidéo'] },
    { title: 'SERVICES', items: ['Artistes & Musiciens', 'Baby-Sitting', 'Billetterie', 'Covoiturage', 'Cours particuliers', 'Entraide entre voisins', 'Évènements', 'Services à la personne', 'Services aux animaux', 'Services de déménagement', 'Services de réparations électroniques', 'Services de réparations mécaniques', 'Services de jardinier & bricolage', 'Services évènementiels', 'Autres services'] },
    { title: 'FAMILLE', items: ['Équipement bébé', 'Mobilier enfant', 'Vêtements bébé'] },
    { title: 'MAISON & JARDIN', items: ['Ameublement', 'Papeterie & Fournitures scolaires', 'Électroménager', 'Arts de la table', 'Décoration', 'Linge de maison', 'Bricolage', 'Jardin & Plantes'] },
    { title: 'MATÉRIEL PROFESSIONNEL', items: ['Tracteurs', 'Matériel agricole', 'BTP - Chantier gros-oeuvre', 'Poids lourds', 'Manutention - Levage', 'Équipements industriels', 'Équipements pour restaurants & hôtels', 'Équipements & Fournitures de bureau', 'Équipements pour commerces & marchés', 'Matériel médical'] },
    { title: 'DIVERS', items: ['Autres'] }
  ];

  const regions = [
    { title: 'OUEST', items: ['Basse-Normandie', 'Bretagne', 'Pays de la Loire', 'Poitou-Charentes'] },
    { title: 'SUD-OUEST', items: ['Aquitaine', 'Midi-Pyrénées'] },
    { title: 'SUD-EST', items: ['Corse', 'Languedoc-Roussillon', 'Provence-Alpes-Côte d\'Azur', 'Rhône-Alpes'] },
    { title: 'EST', items: ['Alsace', 'Bourgogne', 'Champagne-Ardenne', 'Franche-Comté', 'Lorraine'] },
    { title: 'NORD', items: ['Haute-Normandie', 'Nord-Pas-de-Calais', 'Picardie'] },
    { title: 'CENTRE', items: ['Auvergne', 'Centre', 'Ile-de-France', 'Limousin'] },
    { title: 'DROM', items: ['Guadeloupe', 'Martinique', 'Guyane', 'Réunion'] }
  ];

  return (
    <div className="mega-footer">
      <div className="container">
        <div className="mega-grid">
          {categories.map((cat, i) => (
            <div key={i} className="mega-col">
              <h4>{cat.title}</h4>
              <ul>
                {cat.items.map(item => <li key={item}><a href="#">{item}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="mega-divider" />

        <div className="mega-grid regions">
          {regions.map((reg, i) => (
            <div key={i} className="mega-col">
              <h4>{reg.title}</h4>
              <ul>
                {reg.items.map(item => <li key={item}><a href="#">{item}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bottom-footer">
        <div className="container bottom-footer-content">
          <div className="footer-section">
            <h5>À PROPOS DE VOISINS</h5>
            <p>Le 1er site neighborly en France.</p>
          </div>
          <div className="footer-section">
            <h5>INFORMATIONS LÉGALES</h5>
            <ul>
              <li><a href="#">CGU</a></li>
              <li><a href="#">Vie privée</a></li>
            </ul>
          </div>
          <div className="footer-section">
             <h5>NOS SOLUTIONS PROS</h5>
             <p>Boostez votre visibilité locale.</p>
          </div>
          <div className="footer-section">
             <h5>DES QUESTIONS ?</h5>
             <p>On est là pour vous aider.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

