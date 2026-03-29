import { useState } from 'react';
import { 
  LayoutDashboard, Megaphone, Users, BarChart3, Settings, 
  Plus, Filter, Edit2, 
  ExternalLink, Trash2,
  TrendingUp, TrendingDown,
  ArrowLeft, Bell, Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
}

interface Ad {
  id: string;
  name: string;
  type: 'skyscrapper' | 'promoted' | 'banner';
  status: 'active' | 'paused' | 'ended';
  views: number;
  clicks: number;
  ctr: string;
  thumbnail: string;
  startDate: string;
}

const INITIAL_ADS: Ad[] = [
  { id: '1', name: 'Transavia Sky-L', type: 'skyscrapper', status: 'active', views: 45200, clicks: 890, ctr: '1.97%', thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?w=100&h=150&fit=crop', startDate: '24 Mar 2026' },
  { id: '2', name: 'Chalet de Jardin Promo', type: 'promoted', status: 'active', views: 12400, clicks: 340, ctr: '2.74%', thumbnail: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=100&h=100&fit=crop', startDate: '28 Mar 2026' },
  { id: '3', name: 'Elite VTC Global', type: 'banner', status: 'paused', views: 89000, clicks: 1200, ctr: '1.35%', thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=50&fit=crop', startDate: '01 Mar 2026' },
  { id: '4', name: 'Burger King Local', type: 'promoted', status: 'ended', views: 5600, clicks: 45, ctr: '0.80%', thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop', startDate: '15 Feb 2026' },
];

export default function AdminPortal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'users' | 'analytics'>('ads');
  const ads = INITIAL_ADS;

  const stats = [
    { label: 'Revenus Publicitaires', value: '14,250.00 €', trend: '+12.5%', isUp: true },
    { label: 'Expositions Totales', value: '1.2M', trend: '+5.2%', isUp: true },
    { label: 'Clics Moyens', value: '45,800', trend: '-2.1%', isUp: false },
    { label: 'CTR Moyen', value: '2.45%', trend: '+0.8%', isUp: true },
  ];

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
           <Megaphone size={28} color="var(--primary)" />
           <span>Admin <strong>Voisins</strong></span>
        </div>

        <nav className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            className={activeTab === 'ads' ? 'active' : ''} 
            onClick={() => setActiveTab('ads')}
          >
            <Megaphone size={20} /> Publicités
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> Utilisateurs
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''} 
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} /> Statistiques
          </button>
          <button>
            <Settings size={20} /> Paramètres
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn-exit-admin" onClick={onClose}>
            <ArrowLeft size={16} /> Retour au site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* Header */}
        <header className="admin-header">
           <div className="admin-search-bar">
             <SearchIcon size={18} />
             <input type="text" placeholder="Rechercher une annonce, un client..." />
           </div>
           
           <div className="admin-header-actions">
              <button className="icon-btn"><Bell size={20} /></button>
              <div className="admin-user-info">
                <div className="admin-avatar">A</div>
                <span>Administrator</span>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="admin-scroll-area">
          <AnimatePresence mode="wait">
            {activeTab === 'ads' ? (
              <motion.div 
                key="ads" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-page"
              >
                <div className="admin-page-header">
                  <div>
                    <h1>Gestion des Publicités</h1>
                    <p>Contrôlez et optimisez vos campagnes d'affichage.</p>
                  </div>
                  <button className="btn-add-ad">
                    <Plus size={18} /> Nouvelle Campagne
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="admin-stats-row">
                  {stats.map((s, i) => (
                    <div key={i} className="admin-stat-card">
                      <span>{s.label}</span>
                      <div className="stat-val-row">
                        <h3>{s.value}</h3>
                        <div className={`stat-trend ${s.isUp ? 'up' : 'down'}`}>
                          {s.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {s.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ads Table */}
                <div className="admin-table-container">
                  <div className="table-filters">
                    <div className="filter-group">
                      <button className="filter-btn active">Toutes</button>
                      <button className="filter-btn">Actives</button>
                      <button className="filter-btn">En pause</button>
                    </div>
                    <button className="btn-icon-filter"><Filter size={18} /></button>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom de la Campagne</th>
                        <th>Format</th>
                        <th>Statut</th>
                        <th>Performance</th>
                        <th>CTR</th>
                        <th>Lancée le</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads.map((ad) => (
                        <tr key={ad.id}>
                          <td>
                            <div className="ad-td-name">
                              <img src={ad.thumbnail} alt="" />
                              <span>{ad.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`ad-type-tag ${ad.type}`}>
                              {ad.type}
                            </span>
                          </td>
                          <td>
                            <div className={`status-node ${ad.status}`}>
                              <span className="dot" />
                              {ad.status === 'active' ? 'En ligne' : ad.status === 'paused' ? 'En pause' : 'Terminée'}
                            </div>
                          </td>
                          <td>
                            <div className="perf-td">
                              <span><strong>{ad.views.toLocaleString()}</strong> vues</span>
                              <span><strong>{ad.clicks.toLocaleString()}</strong> clics</span>
                            </div>
                          </td>
                          <td><span className="ctr-val">{ad.ctr}</span></td>
                          <td><span className="date-td">{ad.startDate}</span></td>
                          <td>
                            <div className="table-actions">
                              <button title="Éditer"><Edit2 size={16} /></button>
                              <button title="Détails"><ExternalLink size={16} /></button>
                              <button className="delete" title="Supprimer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <div className="admin-empty-state">
                <h2>Bientôt disponible</h2>
                <p>Cette section du portail admin est en cours de développement.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
