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
  ads: any[];
  setAds: (ads: any[]) => void;
}

export default function AdminPortal({ onClose, ads, setAds }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'users' | 'analytics'>('ads');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdName, setNewAdName] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdType, setNewAdType] = useState<'skyscrapper' | 'promoted' | 'banner'>('promoted');
  const [newAdMetadata, setNewAdMetadata] = useState('');
  const [newAdPhotos, setNewAdPhotos] = useState<string[]>([]);



  const addAd = () => {
    if (!newAdName) return;
    const ad: any = {
       id: Math.random().toString(36).substr(2, 9),
       name: newAdName,
       type: newAdType,
       status: 'active',
       views: 0,
       clicks: 0,
       ctr: '0%',
       imageUrl: newAdImage || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
       startDate: new Date().toLocaleDateString('fr-FR'),
       metadata: newAdMetadata,
       photos: newAdPhotos
    };

    setAds([ad, ...ads]);
    setShowAddModal(false);
    setNewAdName('');
    setNewAdImage('');
    setNewAdMetadata('');
    setNewAdPhotos([]);
  };



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
                  <button className="btn-add-ad" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Nouvelle Campagne
                  </button>
                </div>

                {/* Quick Add Modal */}
                {showAddModal && (
                   <div className="admin-inner-modal">
                      <div className="admin-inner-modal-box">
                         <h3>Nouvelle Publicité</h3>
                         <div className="admin-form-group">
                            <label>Nom de la campagne</label>
                            <input type="text" value={newAdName} onChange={e => setNewAdName(e.target.value)} placeholder="Ex: Promo Eté 2026" />
                         </div>
                         <div className="admin-form-group">
                            <label>URL de l'image (Ex: Unsplash)</label>
                            <input type="text" value={newAdImage} onChange={e => setNewAdImage(e.target.value)} placeholder="https://..." />
                         </div>
                         <div className="admin-form-group">
                            <label>Format</label>
                            <select value={newAdType} onChange={e => setNewAdType(e.target.value as any)}>
                               <option value="skyscrapper">Skyscraper (Côtés)</option>
                               <option value="promoted">Sponsorisé (Grille)</option>
                               <option value="banner">Bannière (Large)</option>
                            </select>
                         </div>
                         <div className="admin-form-group">
                            <label>Photos Additionnelles</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                               {newAdPhotos.map((p, idx) => (
                                  <div key={idx} style={{ 
                                     width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', position: 'relative' 
                                  }}>
                                     <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                     <button 
                                        onClick={() => setNewAdPhotos(prev => prev.filter((_, i) => i !== idx))}
                                        style={{ 
                                           position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', 
                                           borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', 
                                           alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' 
                                        }}
                                     >X</button>
                                  </div>
                               ))}
                               <button 
                                  onClick={() => setNewAdPhotos(prev => [...prev, `https://picsum.photos/400/300?random=${Math.random()}`])}
                                  style={{ 
                                     width: '60px', height: '60px', border: '1px dashed var(--border)', borderRadius: '4px', 
                                     display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', background: 'none',
                                     cursor: 'pointer'
                                  }}
                               >
                                  <Plus size={16} />
                               </button>
                            </div>
                         </div>
                         <div className="admin-form-group">

                            <label>Méta-données (JSON ou description)</label>
                            <textarea 
                               value={newAdMetadata} 
                               onChange={e => setNewAdMetadata(e.target.value)} 
                               placeholder='{"region": "Paris", "target": "youth"}'
                               style={{ 
                                  width: '100%', 
                                  minHeight: '80px', 
                                  borderRadius: '8px', 
                                  border: '1px solid var(--border)',
                                  padding: '10px',
                                  fontSize: '13px',
                                  outline: 'none',
                                  fontFamily: 'monospace',
                                  resize: 'vertical'
                               }}
                            />
                         </div>

                         <div className="admin-inner-modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Annuler</button>
                            <button className="btn-confirm" onClick={addAd}>Créer</button>
                         </div>
                      </div>
                   </div>
                )}

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
