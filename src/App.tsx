import { useState } from 'react';
import {
  Search,
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
  Truck
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

const LISTINGS: any[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    numericId: 3032093301,
    user_id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'BMW Série 3 M Sport - Toit ouvrant',
    price: 42900,
    location_city: 'Lyon (69002)',
    created_at: 'Aujourd\'hui, 10:15',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop',
    ],
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop',
    category_slug: 'auto',
    delivery: false,
    pro: true,
    views: 1842,
    description: `BMW Série 3 M Sport en excellent état. Véhicule de 2020 avec 45 000 km au compteur.\n\nÉquipements :\n- Toit ouvrant panoramique\n- Sièges sport M\n- Écran tactile iDrive 7\n- Caméra de recul 360°\n- Régulateur de vitesse adaptatif\n- Jantes M 18 pouces\n\nHistorique complet disponible. Contrôle technique valide jusqu'en 2026. Carnet d'entretien BMW suivi. Première main. Aucun frais à prévoir.`,
    criteria: {
      'Marque': 'BMW',
      'Modèle': 'Série 3',
      'Version': 'M Sport',
      'Année': '2020',
      'Kilométrage': '45 000 km',
      'Carburant': 'Essence',
      'Boîte': 'Automatique',
      'Carrosserie': 'Berline',
      'Couleur': 'Blanc Alpinweiss',
      'Puissance': '184 ch',
      'Nb. portes': '4 portes',
      'CT': 'Valide',
      '1ère main': 'Oui',
    },
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440009',
      full_name: 'Lyon Auto Premium',
      is_verified: true,
      rating_avg: 4.7,
      rating_count: 156,
      location_city: 'Lyon',
      member_since: 'mars 2018',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    numericId: 2987654321,
    user_id: '550e8400-e29b-41d4-a716-446655440008',
    title: 'Sony PS5 Slim + 2 Manettes + 3 Jeux',
    price: 450,
    location_city: 'Bordeaux (33000)',
    created_at: 'Hier, 19:45',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625805866449-3977bbd60e8d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1619894991209-9f9694be045a?q=80&w=1200&auto=format&fit=crop',
    ],
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
    category_slug: 'recreation',
    delivery: true,
    pro: false,
    views: 347,
    description: `PS5 Slim achetée en janvier 2024, vendue car je n'ai plus le temps d'y jouer.\n\nContenu :\n- Console PS5 Slim (édition disc)\n- 2 manettes DualSense (noire + blanche)\n- FIFA 25\n- Spider-Man 2\n- God of War Ragnarök\n\nTout fonctionne parfaitement. Emballage d'origine conservé. Livraison possible en colissimo suivi.`,
    criteria: {
      'État': 'Très bon état',
      'Marque': 'Sony',
      'Modèle': 'PlayStation 5 Slim',
      'Livraison': 'Disponible',
    },
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440008',
      full_name: 'Thomas R.',
      is_verified: true,
      rating_avg: 5.0,
      rating_count: 8,
      location_city: 'Bordeaux',
      member_since: 'juin 2022',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    numericId: 1876543210,
    user_id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Veste en cuir vintage - Taille L',
    price: 85,
    location_city: 'Marseille (13008)',
    created_at: 'Hier, 16:30',
    images: [
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
    ],
    image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800&auto=format&fit=crop',
    category_slug: 'fashion',
    delivery: true,
    pro: false,
    views: 128,
    description: `Veste en cuir véritable des années 90, style biker vintage. Taille L (fits M/L).\n\nTrès bon état général, cuir souple et patine naturelle. Quelques légères marques d'usure conformes à l'âge (visibles sur photos).\n\nMarque : Wilson Leather\nCouleur : Marron cognac\nDoublure : 100% soie\n\nExpédition soignée sous 48h en Colissimo suivi.`,
    criteria: {
      'État': 'Très bon état',
      'Taille': 'L',
      'Matière': 'Cuir véritable',
      'Couleur': 'Marron cognac',
      'Livraison': 'Disponible',
    },
    seller: {
      id: '550e8400-e29b-41d4-a716-446655440007',
      full_name: 'Sara K.',
      is_verified: false,
      rating_avg: 4.5,
      rating_count: 12,
      location_city: 'Marseille',
      member_since: 'janv. 2023',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    numericId: 4400998811,
    user_id: '550e8400-e29b-41d4-a716-446655440008',
    title: 'Tonitruante Tondeuse Honda - À louer',
    price: 30,
    location_city: 'Nantes (44000)',
    created_at: 'Aujourd\'hui, 11:20',
    images: ['https://images.unsplash.com/photo-1592819695396-0661b5ee144e?q=80&w=800&auto=format&fit=crop'],
    image: 'https://images.unsplash.com/photo-1592819695396-0661b5ee144e?q=80&w=400&auto=format&fit=crop',
    category_slug: 'home',
    delivery: false,
    pro: false,
    views: 42,
    description: 'Une tondeuse qui déchire tout ! Pour vos grands jardins.',
    seller: { id: 's22', full_name: 'Jean P.', is_verified: true, rating_avg: 4.9, rating_count: 31, location_city: 'Nantes' }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    numericId: 3300998811,
    user_id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Location Tesla Model 3',
    price: 150,
    location_city: 'Paris (75008)',
    created_at: 'Il y a 2h',
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop'],
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop',
    category_slug: 'auto',
    delivery: true,
    pro: true,
    views: 890,
    description: 'Tout confort, autopilot, recharge illimitée.',
    seller: { id: 's33', full_name: 'VTC Elite', is_verified: true, rating_avg: 4.8, rating_count: 512, location_city: 'Paris' }
  }
];

function App() {
  const { user, loading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [viewedListings, setViewedListings] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('viewed_listings');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

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
    
    const matchesSearch = 
      listing.title.toLowerCase().includes(query) || 
      (listing.description && listing.description.toLowerCase().includes(query)) ||
      (listing.seller && listing.seller.full_name.toLowerCase().includes(query));

    const matchesLocation = 
      !location || 
      listing.location_city.toLowerCase().includes(loc);

    return matchesCategory && matchesSearch && matchesLocation;
  });

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
            <AdminPortal onClose={() => setIsAdminOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Banners (Desktop Sky-scrapers) */}
      <div className="side-banner side-banner-left desktop-only">
        <img src="/Users/yarone/.gemini/antigravity/brain/868fe8d0-90b4-4a35-bf8d-718b65e83e04/side_banner_travel_1774813363000.png" alt="Publicité" />
      </div>
      <div className="side-banner side-banner-right desktop-only">
        <img src="/Users/yarone/.gemini/antigravity/brain/868fe8d0-90b4-4a35-bf8d-718b65e83e04/side_banner_travel_1774813363000.png" alt="Publicité" />
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
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
              <section className="container ads-container">
                <div className="promoted-header">
                  <span className="promoted-tag">Sponsorisé</span>
                </div>
                <div className="promoted-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="promoted-card-mini">
                      <div className="promoted-img-wrapper">
                         <img src={`https://images.unsplash.com/photo-${1580000000000 + i}?auto=format&fit=crop&w=300&q=80`} alt="" />
                         <span className="price-tag-mini">{12000 + i * 500} €</span>
                      </div>
                      <p>Chalet bois en kit</p>
                      <span className="promoted-link">chaletjardin.fr</span>
                    </div>
                  ))}
                </div>
              </section>

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
                <li onClick={() => setIsAdminOpen(true)} className="admin-access-link">Portail Admin (Publicité)</li>
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

export default App;

