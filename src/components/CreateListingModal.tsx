import { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, ChevronDown, MapPin, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────
// Data
// ─────────────────────────────────────────
const TOP_CATEGORIES = [
  { id: 'auto', name: 'Véhicules', emoji: '🚗' },
  { id: 'realestate', name: 'Immobilier', emoji: '🏠' },
  { id: 'tech', name: 'Multimédia', emoji: '📱' },
  { id: 'home', name: 'Maison & Jardin', emoji: '🛋️' },
  { id: 'fashion', name: 'Mode', emoji: '👗' },
  { id: 'recreation', name: 'Loisirs', emoji: '🎮' },
  { id: 'services', name: 'Services', emoji: '🔧' },
  { id: 'jobs', name: 'Emploi', emoji: '💼' },
  { id: 'animals', name: 'Animaux', emoji: '🐾' },
  { id: 'other', name: 'Autres', emoji: '📦' },
];

const AUTO_SUB = [
  { id: 'voitures', name: 'Voitures' },
  { id: 'motos', name: 'Motos' },
  { id: 'caravaning', name: 'Caravaning' },
  { id: 'utilitaires', name: 'Utilitaires' },
  { id: 'nautisme', name: 'Nautisme' },
  { id: 'equipement-auto', name: 'Équipements auto' },
];

const MARQUES = [
  'Abarth','Alfa Romeo','Aston Martin','Audi','BMW','Bugatti','Cadillac','Chevrolet','Chrysler',
  'Citroën','Dacia','Dodge','DS','Ferrari','Fiat','Ford','Honda','Hummer','Hyundai',
  'Infiniti','Jaguar','Jeep','Kia','Lamborghini','Lancia','Land Rover','Lexus','Lotus',
  'Maserati','Mazda','McLaren','Mercedes-Benz','MG','Mini','Mitsubishi','Nissan','Opel',
  'Peugeot','Pontiac','Porsche','Renault','Rolls-Royce','SEAT','Skoda','Smart','Subaru',
  'Suzuki','Tesla','Toyota','Volkswagen','Volvo','Autre',
];

const CARBURANTS = ['Essence','Diesel','Électrique','Hybride rechargeable','Hybride','GPL','GNV','Hydrogène'];
const BOITES = ['Manuelle','Automatique','Semi-automatique'];
const CARROSSERIES = ['Berline','SUV / 4x4','Citadine','Break','Coupé','Cabriolet / Roadster','Monospace','Pick-up','Utilitaire','Autre'];
const COULEURS = ['Beige','Blanc','Bleu','Bordeaux','Gris','Jaune','Marron','Noir','Orange','Rouge','Vert','Violet','Autre'];
const PORTES = ['2 portes','3 portes','4 portes','5 portes'];
const PLACES = ['2','3','4','5','6','7','8','9+'];
const GARANTIES = ['Garantie constructeur','Garantie revendeur','Aucune garantie'];
const CT_OPTIONS = ['CT valide','CT non fait','Sans objet'];

const EQUIPEMENTS = [
  'Climatisation','Climatisation automatique','GPS / Navigation','Régulateur de vitesse',
  'Limiteur de vitesse','Bluetooth / Mains libres','Caméra de recul','Radar de recul',
  'Radar avant','Toit ouvrant','Toit panoramique','Sièges chauffants','Sièges en cuir',
  'Jantes alliage','Aide au stationnement','Start/Stop automatique',
  'Apple CarPlay / Android Auto','Cruise control adaptatif','Keyless / Accès sans clé',
  'Vitres électriques','Rétroviseurs électriques','Phares LED / Xénon','Attelage',
  'Suspension pneumatique','Direction assistée','ABS','ESP',
];

const CONDITIONS_MOTO = ['new','like_new','good','fair','poor'];
const CONDITIONS_LABELS: Record<string, string> = {
  new: 'Neuf', like_new: 'Très bon état', good: 'Bon état', fair: 'État correct', poor: 'Pour pièces',
};

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface VehicleForm {
  subCategory: string;
  marque: string;
  modele: string;
  version: string;
  annee: string;
  kilometrage: string;
  carburant: string;
  boite: string;
  carrosserie: string;
  couleur: string;
  portes: string;
  places: string;
  puissanceFiscale: string;
  puissanceDIN: string;
  cylindree: string;
  premiereMain: boolean;
  ct: string;
  garantie: string;
  carnetEntretien: boolean;
  equipements: string[];
  // communs
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  city: string;
  zip: string;
}

interface GeneralForm {
  category: string;
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  condition: string;
  city: string;
  zip: string;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function Field({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}{required && <span className="required"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error-msg"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string; error?: boolean;
}) {
  return (
    <div className="select-wrapper">
      <select
        className={`field-select ${error ? 'field-error' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      <ChevronDown size={16} className="select-arrow" />
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`condition-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {active && <Check size={12} style={{ marginRight: 4 }} />}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────
// Steps Vehicle
// ─────────────────────────────────────────
const YEARS = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => String(new Date().getFullYear() - i));

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function CreateListingModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState('');
  const [step, setStep] = useState(0); // 0 = category picker
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuto = category === 'auto';

  // Vehicle form state
  const [vf, setVf] = useState<VehicleForm>({
    subCategory: 'voitures', marque: '', modele: '', version: '', annee: '',
    kilometrage: '', carburant: '', boite: '', carrosserie: '', couleur: '',
    portes: '', places: '', puissanceFiscale: '', puissanceDIN: '', cylindree: '',
    premiereMain: false, ct: '', garantie: '', carnetEntretien: false, equipements: [],
    title: '', description: '', price: '', negotiable: false, city: '', zip: '',
  });

  // General form state
  const [gf, setGf] = useState<GeneralForm>({
    category: '', title: '', description: '', price: '', negotiable: false, condition: '', city: '', zip: '',
  });

  const updateVf = <K extends keyof VehicleForm>(k: K, v: VehicleForm[K]) => {
    setVf(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const updateGf = <K extends keyof GeneralForm>(k: K, v: GeneralForm[K]) => {
    setGf(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const toggleEquipement = (eq: string) => {
    setVf(prev => ({
      ...prev,
      equipements: prev.equipements.includes(eq)
        ? prev.equipements.filter(e => e !== eq)
        : [...prev.equipements, eq],
    }));
  };

  function handleImages(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 8 - images.length);
    setImages(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }

  function removeImage(i: number) {
    setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i); });
  }

  // Validation
  function validateVehicleStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!vf.marque) e.marque = 'Champ obligatoire';
      if (!vf.annee) e.annee = 'Champ obligatoire';
      if (!vf.kilometrage) e.kilometrage = 'Champ obligatoire';
      if (!vf.carburant) e.carburant = 'Champ obligatoire';
      if (!vf.boite) e.boite = 'Champ obligatoire';
    }
    if (s === 3) {
      if (!vf.title.trim()) e.title = 'Titre obligatoire';
      if (vf.title.trim().length < 5) e.title = 'Titre trop court';
      if (!vf.description.trim()) e.description = 'Description obligatoire';
      if (vf.description.trim().length < 15) e.description = 'Description trop courte';
      if (!vf.city.trim()) e.city = 'Ville obligatoire';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateGeneralStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!gf.title.trim()) e.title = 'Titre obligatoire';
      if (gf.title.trim().length < 5) e.title = 'Titre trop court';
      if (!gf.description.trim()) e.description = 'Description obligatoire';
      if (gf.description.trim().length < 15) e.description = 'Description trop courte';
    }
    if (s === 2) {
      if (!gf.city.trim()) e.city = 'Ville obligatoire';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    const ok = isAuto ? validateVehicleStep(step) : validateGeneralStep(step);
    if (ok) setStep(s => s + 1);
  }

  // Steps config
  const autoSteps = ['Identification', 'Caractéristiques', 'État & Équipements', 'Annonce', 'Photos'];
  const generalSteps = ['Annonce', 'Localisation', 'Photos'];
  const steps = isAuto ? autoSteps : generalSteps;
  const totalSteps = steps.length;

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h2>Annonce publiée !</h2>
            <p>Votre annonce est maintenant en ligne.</p>
            <button className="btn-submit" onClick={onClose}>Retour à l'accueil</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: step === 0 ? 560 : 680 }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 0 ? 'Que vendez-vous ?' : `Déposer une annonce — ${steps[step - 1]}`}
          </h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Progress bar (not on category pick) */}
        {step > 0 && (
          <div className="modal-progress-bar">
            <div className="modal-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        )}

        {/* Steps pills */}
        {step > 0 && (
          <div className="modal-steps-pills">
            {steps.map((s, i) => (
              <div key={s} className={`pill ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`}>
                <span className="pill-dot">{i + 1 < step ? '✓' : i + 1}</span>
                <span className="pill-label">{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          <AnimatePresence mode="wait">

            {/* ── Step 0 : Catégorie ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-step-content">
                <div className="category-pick-grid">
                  {TOP_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`cat-pick-btn ${category === cat.id ? 'active' : ''}`}
                      onClick={() => { setCategory(cat.id); setStep(1); setGf(p => ({ ...p, category: cat.id })); }}
                    >
                      <span className="cat-pick-emoji">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════
                VÉHICULES
            ══════════════════════════════ */}

            {/* Step 1 Auto : Identification */}
            {isAuto && step === 1 && (
              <motion.div key="a1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <Field label="Sous-catégorie" required>
                  <div className="condition-grid">
                    {AUTO_SUB.map(s => (
                      <ToggleChip key={s.id} label={s.name} active={vf.subCategory === s.id} onClick={() => updateVf('subCategory', s.id)} />
                    ))}
                  </div>
                </Field>

                <div className="form-row-2">
                  <Field label="Marque" required error={errors.marque}>
                    <Select value={vf.marque} onChange={v => updateVf('marque', v)} options={MARQUES} placeholder="Sélectionner" error={!!errors.marque} />
                  </Field>
                  <Field label="Modèle">
                    <input className="field-input" placeholder="Ex : Clio, Série 3…" value={vf.modele} onChange={e => updateVf('modele', e.target.value)} />
                  </Field>
                </div>

                <Field label="Version / Finition">
                  <input className="field-input" placeholder="Ex : GTi, AMG, TDI Confortline…" value={vf.version} onChange={e => updateVf('version', e.target.value)} />
                </Field>

                <div className="form-row-2">
                  <Field label="Année" required error={errors.annee}>
                    <Select value={vf.annee} onChange={v => updateVf('annee', v)} options={YEARS} placeholder="Année" error={!!errors.annee} />
                  </Field>
                  <Field label="Kilométrage" required error={errors.kilometrage}>
                    <div className="input-unit-wrapper">
                      <input className={`field-input ${errors.kilometrage ? 'field-error' : ''}`} type="number" placeholder="Ex : 45000" min="0" value={vf.kilometrage} onChange={e => updateVf('kilometrage', e.target.value)} />
                      <span className="input-unit">km</span>
                    </div>
                  </Field>
                </div>

                <div className="form-row-2">
                  <Field label="Carburant" required error={errors.carburant}>
                    <Select value={vf.carburant} onChange={v => updateVf('carburant', v)} options={CARBURANTS} placeholder="Sélectionner" error={!!errors.carburant} />
                  </Field>
                  <Field label="Boîte de vitesse" required error={errors.boite}>
                    <Select value={vf.boite} onChange={v => updateVf('boite', v)} options={BOITES} placeholder="Sélectionner" error={!!errors.boite} />
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Step 2 Auto : Caractéristiques */}
            {isAuto && step === 2 && (
              <motion.div key="a2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <div className="form-row-2">
                  <Field label="Carrosserie">
                    <Select value={vf.carrosserie} onChange={v => updateVf('carrosserie', v)} options={CARROSSERIES} placeholder="Sélectionner" />
                  </Field>
                  <Field label="Couleur">
                    <Select value={vf.couleur} onChange={v => updateVf('couleur', v)} options={COULEURS} placeholder="Sélectionner" />
                  </Field>
                </div>

                <div className="form-row-3">
                  <Field label="Nb. de portes">
                    <Select value={vf.portes} onChange={v => updateVf('portes', v)} options={PORTES} placeholder="—" />
                  </Field>
                  <Field label="Nb. de places">
                    <Select value={vf.places} onChange={v => updateVf('places', v)} options={PLACES} placeholder="—" />
                  </Field>
                </div>

                <div className="form-row-3">
                  <Field label="Puissance fiscale" hint="en CV">
                    <div className="input-unit-wrapper">
                      <input className="field-input" type="number" placeholder="Ex : 7" min="0" value={vf.puissanceFiscale} onChange={e => updateVf('puissanceFiscale', e.target.value)} />
                      <span className="input-unit">CV</span>
                    </div>
                  </Field>
                  <Field label="Puissance DIN" hint="en ch">
                    <div className="input-unit-wrapper">
                      <input className="field-input" type="number" placeholder="Ex : 130" min="0" value={vf.puissanceDIN} onChange={e => updateVf('puissanceDIN', e.target.value)} />
                      <span className="input-unit">ch</span>
                    </div>
                  </Field>
                  <Field label="Cylindrée">
                    <div className="input-unit-wrapper">
                      <input className="field-input" type="number" placeholder="Ex : 1598" min="0" value={vf.cylindree} onChange={e => updateVf('cylindree', e.target.value)} />
                      <span className="input-unit">cm³</span>
                    </div>
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Step 3 Auto : État & Équipements */}
            {isAuto && step === 3 && (
              <motion.div key="a3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <Field label="Contrôle technique">
                  <div className="condition-grid">
                    {CT_OPTIONS.map(o => <ToggleChip key={o} label={o} active={vf.ct === o} onClick={() => updateVf('ct', vf.ct === o ? '' : o)} />)}
                  </div>
                </Field>

                <Field label="Garantie">
                  <div className="condition-grid">
                    {GARANTIES.map(g => <ToggleChip key={g} label={g} active={vf.garantie === g} onClick={() => updateVf('garantie', vf.garantie === g ? '' : g)} />)}
                  </div>
                </Field>

                <div className="form-row-2-equal">
                  <label className="toggle-row">
                    <input type="checkbox" checked={vf.premiereMain} onChange={e => updateVf('premiereMain', e.target.checked)} />
                    <div className="toggle-text">
                      <span className="toggle-label">Première main</span>
                      <span className="toggle-hint">Vous êtes le premier propriétaire</span>
                    </div>
                  </label>
                  <label className="toggle-row">
                    <input type="checkbox" checked={vf.carnetEntretien} onChange={e => updateVf('carnetEntretien', e.target.checked)} />
                    <div className="toggle-text">
                      <span className="toggle-label">Carnet d'entretien</span>
                      <span className="toggle-hint">Suivi complet disponible</span>
                    </div>
                  </label>
                </div>

                <Field label="Équipements et options">
                  <div className="equipements-grid">
                    {EQUIPEMENTS.map(eq => (
                      <label key={eq} className={`equip-chip ${vf.equipements.includes(eq) ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={vf.equipements.includes(eq)}
                          onChange={() => toggleEquipement(eq)}
                          style={{ display: 'none' }}
                        />
                        {vf.equipements.includes(eq) && <Check size={11} />}
                        {eq}
                      </label>
                    ))}
                  </div>
                </Field>
              </motion.div>
            )}

            {/* Step 4 Auto : Annonce (titre, description, prix, localisation) */}
            {isAuto && step === 4 && (
              <motion.div key="a4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <Field label="Titre de l'annonce" required error={errors.title}>
                  <input
                    className={`field-input ${errors.title ? 'field-error' : ''}`}
                    placeholder={`Ex : ${vf.marque || 'Renault'} ${vf.modele || 'Clio'} ${vf.annee || '2020'} — ${vf.kilometrage || '50000'} km`}
                    value={vf.title}
                    onChange={e => updateVf('title', e.target.value)}
                    maxLength={70}
                  />
                  <div className="field-hint-row">
                    {errors.title ? <p className="field-error-msg"><AlertCircle size={12} />{errors.title}</p> : <span />}
                    <span className="char-count">{vf.title.length}/70</span>
                  </div>
                </Field>

                <Field label="Description" required error={errors.description}>
                  <textarea
                    className={`field-textarea ${errors.description ? 'field-error' : ''}`}
                    placeholder="Décrivez l'historique du véhicule, son état général, les éventuels travaux réalisés, les options…"
                    value={vf.description}
                    onChange={e => updateVf('description', e.target.value)}
                    rows={5}
                    maxLength={4000}
                  />
                  <div className="field-hint-row">
                    {errors.description ? <p className="field-error-msg"><AlertCircle size={12} />{errors.description}</p> : <span />}
                    <span className="char-count">{vf.description.length}/4000</span>
                  </div>
                </Field>

                <div className="form-row-2">
                  <Field label="Prix de vente">
                    <div className="price-row">
                      <div className="price-input-wrapper">
                        <input className="field-input" type="number" placeholder="0" min="0" value={vf.price} onChange={e => updateVf('price', e.target.value)} />
                        <span className="price-euro">€</span>
                      </div>
                    </div>
                  </Field>
                  <Field label=" ">
                    <label className="checkbox-label" style={{ marginTop: 32 }}>
                      <input type="checkbox" checked={vf.negotiable} onChange={e => updateVf('negotiable', e.target.checked)} />
                      Prix négociable
                    </label>
                  </Field>
                </div>

                <div className="form-row-2">
                  <Field label="Ville" required error={errors.city}>
                    <input className={`field-input ${errors.city ? 'field-error' : ''}`} placeholder="Ex : Paris, Lyon…" value={vf.city} onChange={e => updateVf('city', e.target.value)} />
                    {errors.city && <p className="field-error-msg"><AlertCircle size={12} />{errors.city}</p>}
                  </Field>
                  <Field label="Code postal">
                    <input className="field-input" placeholder="Ex : 75001" value={vf.zip} onChange={e => updateVf('zip', e.target.value)} maxLength={5} />
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Step 5 Auto : Photos */}
            {isAuto && step === 5 && (
              <motion.div key="a5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <PhotoStep images={images} onAdd={handleImages} onRemove={removeImage} fileInputRef={fileInputRef} />
                <AutoRecap vf={vf} />
              </motion.div>
            )}

            {/* ══════════════════════════════
                GENERAL (non-véhicule)
            ══════════════════════════════ */}

            {!isAuto && step === 1 && (
              <motion.div key="g1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <Field label="Titre de l'annonce" required error={errors.title}>
                  <input className={`field-input ${errors.title ? 'field-error' : ''}`} placeholder="Ex : iPhone 15 Pro Max 256 Go" value={gf.title} onChange={e => updateGf('title', e.target.value)} maxLength={70} />
                  <div className="field-hint-row">
                    {errors.title ? <p className="field-error-msg"><AlertCircle size={12} />{errors.title}</p> : <span />}
                    <span className="char-count">{gf.title.length}/70</span>
                  </div>
                </Field>
                <Field label="Description" required error={errors.description}>
                  <textarea className={`field-textarea ${errors.description ? 'field-error' : ''}`} placeholder="Décrivez votre article, son état, la raison de la vente…" value={gf.description} onChange={e => updateGf('description', e.target.value)} rows={5} maxLength={4000} />
                  <div className="field-hint-row">
                    {errors.description ? <p className="field-error-msg"><AlertCircle size={12} />{errors.description}</p> : <span />}
                    <span className="char-count">{gf.description.length}/4000</span>
                  </div>
                </Field>
                <div className="form-row-2">
                  <Field label="Prix (€)">
                    <div className="price-input-wrapper">
                      <input className="field-input" type="number" placeholder="0" min="0" value={gf.price} onChange={e => updateGf('price', e.target.value)} />
                      <span className="price-euro">€</span>
                    </div>
                  </Field>
                  <Field label=" ">
                    <label className="checkbox-label" style={{ marginTop: 32 }}>
                      <input type="checkbox" checked={gf.negotiable} onChange={e => updateGf('negotiable', e.target.checked)} />
                      Prix négociable
                    </label>
                  </Field>
                </div>
                <Field label="État de l'article">
                  <div className="condition-grid">
                    {CONDITIONS_MOTO.map(c => (
                      <ToggleChip key={c} label={CONDITIONS_LABELS[c]} active={gf.condition === c} onClick={() => updateGf('condition', gf.condition === c ? '' : c)} />
                    ))}
                  </div>
                </Field>
              </motion.div>
            )}

            {!isAuto && step === 2 && (
              <motion.div key="g2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <div className="form-row-2">
                  <Field label="Ville" required error={errors.city}>
                    <input className={`field-input ${errors.city ? 'field-error' : ''}`} placeholder="Ex : Paris, Lyon…" value={gf.city} onChange={e => updateGf('city', e.target.value)} />
                    {errors.city && <p className="field-error-msg"><AlertCircle size={12} />{errors.city}</p>}
                  </Field>
                  <Field label="Code postal">
                    <input className="field-input" placeholder="Ex : 75001" value={gf.zip} onChange={e => updateGf('zip', e.target.value)} maxLength={5} />
                  </Field>
                </div>
                <div className="location-note">
                  <MapPin size={16} color="var(--primary)" />
                  <p>Votre adresse exacte ne sera pas affichée — seulement la ville.</p>
                </div>
              </motion.div>
            )}

            {!isAuto && step === 3 && (
              <motion.div key="g3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modal-step-content">
                <PhotoStep images={images} onAdd={handleImages} onRemove={removeImage} fileInputRef={fileInputRef} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {step > 0 && (
          <div className="modal-footer">
            <button className="btn-prev" onClick={() => { setErrors({}); setStep(s => s - 1); }}>
              {step === 1 ? 'Changer de catégorie' : 'Précédent'}
            </button>
            <div style={{ flex: 1 }} />
            <span className="step-counter">{step} / {totalSteps}</span>
            {step < totalSteps ? (
              <button className="btn-submit" onClick={handleNext}>Continuer</button>
            ) : (
              <button className="btn-submit" onClick={() => setSubmitted(true)}>
                Publier l'annonce
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────
function PhotoStep({ images, onAdd, onRemove, fileInputRef }: {
  images: { preview: string }[];
  onAdd: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <>
      <p className="photos-hint">
        📸 Ajoutez jusqu'à 8 photos. La première sera la photo principale.
      </p>
      <div className="photo-grid">
        {images.map((img, i) => (
          <div key={i} className="photo-thumb">
            <img src={img.preview} alt="" />
            {i === 0 && <span className="photo-main-badge">Principale</span>}
            <button className="photo-remove" onClick={() => onRemove(i)}><X size={12} /></button>
          </div>
        ))}
        {images.length < 8 && (
          <button className="photo-add-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={24} />
            <span>Ajouter</span>
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onAdd} />
    </>
  );
}

function AutoRecap({ vf }: { vf: VehicleForm }) {
  const rows = [
    ['Marque / Modèle', [vf.marque, vf.modele, vf.version].filter(Boolean).join(' ')],
    ['Année', vf.annee],
    ['Kilométrage', vf.kilometrage ? `${Number(vf.kilometrage).toLocaleString('fr-FR')} km` : ''],
    ['Carburant', vf.carburant],
    ['Boîte', vf.boite],
    ['Carrosserie', vf.carrosserie],
    ['Couleur', vf.couleur],
    ['CT', vf.ct],
    ['Garantie', vf.garantie],
    ['Prix', vf.price ? `${Number(vf.price).toLocaleString('fr-FR')} €${vf.negotiable ? ' (négociable)' : ''}` : 'Non précisé'],
    ['Localisation', [vf.city, vf.zip].filter(Boolean).join(' ')],
  ].filter(([, v]) => v);

  if (rows.length === 0) return null;

  return (
    <div className="recap-card">
      <h4>Récapitulatif</h4>
      {rows.map(([k, v]) => (
        <div key={k} className="recap-row">
          <span>{k}</span>
          <strong>{v}</strong>
        </div>
      ))}
      {vf.equipements.length > 0 && (
        <div className="recap-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span>Équipements ({vf.equipements.length})</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {vf.equipements.map(e => <span key={e} className="equip-chip active" style={{ fontSize: 11 }}>{e}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
