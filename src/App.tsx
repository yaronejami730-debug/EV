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
  TrendingUp
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
}

const LISTINGS: any[] = [];

function App() {
  const { user, loading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showMessages, setShowMessages] = useState(false);
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
  const [ads, setAds] = useState<Ad[]>([]);
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

      {/* Side Banners (Live Skyscrapers) */}
      <div className="side-banner side-banner-left desktop-only">
        {ads.filter(a => a.type === 'skyscrapper' && a.status === 'active').slice(0, 1).map(ad => (
           <img key={ad.id} src={ad.imageUrl} alt={ad.name} className="ad-img-full" />
        ))}
        {!ads.some(a => a.type === 'skyscrapper' && a.status === 'active') && (
           <div className="skyscraper-placeholder-mini">Publicité</div>
        )}
      </div>
      <div className="side-banner side-banner-right desktop-only">
        {ads.filter(a => a.type === 'skyscrapper' && a.status === 'active').slice(1, 2).map(ad => (
           <img key={ad.id} src={ad.imageUrl} alt={ad.name} className="ad-img-full" />
        ))}
        {ads.filter(a => a.type === 'skyscrapper' && a.status === 'active').length < 2 && (
           <div className="skyscraper-placeholder-mini">Publicité</div>
        )}
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="menu-btn mobile-only">
            <Menu size={24} />
          </button>
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); setSelectedListing(null); setShowMessages(false); }}>
            Entre Voisins
          </a>
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
          {!loading && (
            user
              ? <UserMenu
                  onOpenMessages={() => { setShowMessages(true); setSelectedListing(null); }}
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

              {/* Advertisers / Promoted Section */}
              {/* Live Promoted Section */}
              {ads.some(a => a.type === 'promoted' && a.status === 'active') && (
                <section className="container ads-container">
                  <div className="promoted-header">
                    <span className="promoted-tag">Sponsorisé</span>
                  </div>
                  <div className="promoted-grid">
                    {ads.filter(a => a.type === 'promoted' && a.status === 'active').map((ad) => (
                      <div key={ad.id} className="promoted-card-mini">
                        <div className="promoted-img-wrapper">
                           <img src={ad.imageUrl} alt={ad.name} className="ad-img-full" />
                        </div>
                        <p>{ad.name}</p>
                        <span className="promoted-link">sponsorisé</span>
                      </div>
                    ))}
                  </div>
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

