/**
 * src/components/modals/RegisterDeviceModal.js
 * ─────────────────────────────────────────────
 * 3-step device registration modal with full owner profile.
 *
 * STEP 1 — Owner Information
 *   Full name, phone, email, NRC/ID number, physical address,
 *   district, and an emergency reference contact.
 *
 * STEP 2 — Device Details
 *   Type, make, model, colour, purchase date, place, estimated value.
 *
 * STEP 3 — Device Identifiers
 *   IMEI 1 & 2 (phones/tablets), MAC address (laptops), serial number.
 *
 * WHY OWNER PROFILE MATTERS:
 *   Police finding an unregistered-as-stolen device can enter the IMEI
 *   into SDIRS and immediately see who the registered owner is, their
 *   full address, phone number, and the emergency reference contact —
 *   so even if the owner's number is unreachable, there is always
 *   a backup person to call.
 *
 *   The public IMEI checker shows ONLY clean/stolen status.
 *   Full owner details are ONLY visible to police and MACRA.
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppDispatch, useToast, useCurrentUser } from '../../context/AppContext';

const DEVICE_TYPES = [
  { value: 'mobile',  label: '📱 Mobile Phone' },
  { value: 'laptop',  label: '💻 Laptop' },
  { value: 'tablet',  label: '📟 Tablet' },
  { value: 'desktop', label: '🖥️ Desktop' },
];

const DISTRICTS = [
  'Lilongwe','Blantyre','Zomba','Mzuzu','Kasungu','Mchinji','Karonga',
  'Salima','Dedza','Ntcheu','Balaka','Machinga','Mangochi','Chiradzulu',
  'Thyolo','Mulanje','Phalombe','Chikwawa','Nsanje','Nkhotakota',
  'Ntchisi','Dowa','Mzimba','Rumphi','Chitipa','Likoma',
];

const ID_TYPES = [
  { value: 'nrc',      label: 'National Registration Card (NRC)' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers',  label: "Driver's Licence" },
  { value: 'voter',    label: 'Voter Registration Card' },
];

const STEPS = [
  { n: 1, label: 'Owner Info',  icon: '👤' },
  { n: 2, label: 'Device Info', icon: '📱' },
  { n: 3, label: 'Identifiers', icon: '🔢' },
];

export default function RegisterDeviceModal({ onClose }) {
  const dispatch    = useAppDispatch();
  const showToast   = useToast();
  const currentUser = useCurrentUser();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1 — Owner
    ownerFullName:     currentUser?.name  || '',
    ownerPhone:        currentUser?.phone || '',
    ownerEmail:        currentUser?.email || '',
    ownerIdType:       'nrc',
    ownerIdNumber:     '',
    ownerDistrict:     '',
    ownerVillageArea:  '',
    ownerResidence:    '',
    // Step 1 — Reference contact
    refName:           '',
    refRelationship:   '',
    refPhone:          '',
    refEmail:          '',
    // Step 2 — Device
    type:              'mobile',
    make:              '',
    model:             '',
    color:             '',
    purchaseDate:      '',
    purchasePlace:     '',
    estimatedValueMWK: '',
    // Step 3 — Identifiers
    imei:              '',
    imei2:             '',
    mac:               '',
    serial:            '',
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const showImei = form.type === 'mobile' || form.type === 'tablet';
  const showMac  = form.type === 'laptop' || form.type === 'tablet' || form.type === 'desktop';

  function validateStep(s) {
    if (s === 1) {
      if (!form.ownerFullName.trim())  { showToast('Enter your full name.', '', 'warn');              return false; }
      if (!form.ownerPhone.trim())     { showToast('Enter your phone number.', '', 'warn');           return false; }
      if (!form.ownerIdNumber.trim())  { showToast('Enter your NRC / ID number.', '', 'warn');        return false; }
      if (!form.ownerDistrict)         { showToast('Select your district.', '', 'warn');              return false; }
      if (!form.ownerResidence.trim()) { showToast('Enter your physical address.', '', 'warn');       return false; }
      if (!form.refName.trim())        { showToast('Enter an emergency contact name.', '', 'warn');   return false; }
      if (!form.refPhone.trim())       { showToast('Enter the emergency contact phone.', '', 'warn'); return false; }
    }
    if (s === 2) {
      if (!form.make.trim())  { showToast('Enter the device make / brand.', '', 'warn'); return false; }
      if (!form.model.trim()) { showToast('Enter the device model.', '', 'warn');        return false; }
    }
    if (s === 3) {
      if (showImei && !form.imei.trim() && !form.serial.trim()) {
        showToast('Enter at least the IMEI or serial number.', '', 'warn');
        return false;
      }
      if (showMac && !form.mac.trim() && !form.serial.trim()) {
        showToast('Enter at least the MAC address or serial number.', '', 'warn');
        return false;
      }
    }
    return true;
  }

  function handleNext()   { if (validateStep(step)) setStep(s => s + 1); }
  function handleBack()   { setStep(s => s - 1); }

  function handleSubmit() {
    if (!validateStep(3)) return;

    dispatch({
      type: 'REGISTER_DEVICE',
      payload: {
        type:              form.type,
        make:              form.make.trim(),
        model:             form.model.trim(),
        color:             form.color.trim(),
        imei:              form.imei.trim()   || null,
        imei2:             form.imei2.trim()  || null,
        mac:               form.mac.trim()    || null,
        serial:            form.serial.trim() || null,
        purchaseDate:      form.purchaseDate       || null,
        purchasePlace:     form.purchasePlace.trim() || null,
        estimatedValueMWK: parseInt(form.estimatedValueMWK) || null,
        ownerProfile: {
          fullName:    form.ownerFullName.trim(),
          phone:       form.ownerPhone.trim(),
          email:       form.ownerEmail.trim(),
          idType:      form.ownerIdType,
          idNumber:    form.ownerIdNumber.trim(),
          district:    form.ownerDistrict,
          villageArea: form.ownerVillageArea.trim(),
          residence:   form.ownerResidence.trim(),
        },
        referenceContact: {
          name:         form.refName.trim(),
          relationship: form.refRelationship.trim(),
          phone:        form.refPhone.trim(),
          email:        form.refEmail.trim(),
        },
      },
    });

    showToast(
      `${form.make} ${form.model} registered!`,
      'Device and owner profile saved in the national registry.',
      'success'
    );
    onClose();
  }

  return (
    <Modal title="📋 Register Device in National Registry" onClose={onClose} wide>
      <div className="modal-body">

        {/* ── Step progress indicator ── */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                <div style={{
                  width:38, height:38, borderRadius:'50%',
                  background: step >= s.n ? 'var(--blue)' : 'var(--bg-2)',
                  border: `2px solid ${step >= s.n ? 'var(--blue)' : 'var(--muted-3)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: step > s.n ? 14 : 16, color: step >= s.n ? '#fff' : 'var(--muted)',
                  transition:'all .2s',
                }}>
                  {step > s.n ? '✓' : s.icon}
                </div>
                <div style={{ fontSize:10, fontWeight:700, color: step >= s.n ? 'var(--blue)' : 'var(--muted)', textAlign:'center' }}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:1, height:2, background: step > s.n ? 'var(--blue)' : 'var(--muted-3)', marginBottom:20, transition:'background .2s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            STEP 1 — OWNER INFORMATION
        ══════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <SectionTitle color="var(--blue)">👤 Owner Personal Details</SectionTitle>

            <div className="field">
              <label className="field-label">Full Name (as on NRC / Passport) *</label>
              <input className="field-input" placeholder="e.g. Chisomo James Banda"
                value={form.ownerFullName} onChange={e => update('ownerFullName', e.target.value)} />
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Primary Phone Number *</label>
                <input className="field-input" placeholder="+265 991 234 567"
                  value={form.ownerPhone} onChange={e => update('ownerPhone', e.target.value)} />
                <div className="field-hint">Police call this number first when device is found</div>
              </div>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input className="field-input" type="email" placeholder="yourname@email.com"
                  value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">ID Type *</label>
                <select className="field-input field-select" value={form.ownerIdType} onChange={e => update('ownerIdType', e.target.value)}>
                  {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">ID / NRC Number *</label>
                <input className="field-input mono" placeholder="e.g. 12-3456789-7-01"
                  value={form.ownerIdNumber} onChange={e => update('ownerIdNumber', e.target.value)} />
              </div>
            </div>

            <SectionTitle color="var(--blue)" top>📍 Residential Address</SectionTitle>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">District *</label>
                <select className="field-input field-select" value={form.ownerDistrict} onChange={e => update('ownerDistrict', e.target.value)}>
                  <option value="">— Select district —</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Village / Area / Township</label>
                <input className="field-input" placeholder="e.g. Area 13, Kawale, Mbayani"
                  value={form.ownerVillageArea} onChange={e => update('ownerVillageArea', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Full Physical Address *</label>
              <textarea className="field-input" style={{ minHeight:72 }}
                placeholder="e.g. House No. 14, Kamuzu Barracks Road, Area 13, Lilongwe. Green gate, next to Shoprite."
                value={form.ownerResidence} onChange={e => update('ownerResidence', e.target.value)} />
              <div className="field-hint">Be as specific as possible — this helps police locate you</div>
            </div>

            <SectionTitle color="var(--red)" top>🆘 Emergency Reference Contact</SectionTitle>

            <div className="alert alert-blue" style={{ marginBottom:16 }}>
              <span className="alert-icon">ℹ️</span>
              <div>If police cannot reach you, they will call this person. Choose a reliable family member, spouse, or colleague.</div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Reference Person Full Name *</label>
                <input className="field-input" placeholder="e.g. Mary Banda"
                  value={form.refName} onChange={e => update('refName', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Relationship to Owner</label>
                <input className="field-input" placeholder="e.g. Spouse, Parent, Sibling, Colleague"
                  value={form.refRelationship} onChange={e => update('refRelationship', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Reference Phone Number *</label>
                <input className="field-input" placeholder="+265 881 234 567"
                  value={form.refPhone} onChange={e => update('refPhone', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Reference Email (optional)</label>
                <input className="field-input" type="email" placeholder="reference@email.com"
                  value={form.refEmail} onChange={e => update('refEmail', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2 — DEVICE DETAILS
        ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <SectionTitle color="var(--blue)">📱 Device Details</SectionTitle>

            <div className="field">
              <label className="field-label">Device Type *</label>
              <select className="field-input field-select" value={form.type} onChange={e => update('type', e.target.value)}>
                {DEVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Make / Brand *</label>
                <input className="field-input" placeholder="Samsung, Apple, Lenovo, HP..."
                  value={form.make} onChange={e => update('make', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Model *</label>
                <input className="field-input" placeholder="Galaxy A54, ThinkPad X1, Envy 14..."
                  value={form.model} onChange={e => update('model', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Colour</label>
                <input className="field-input" placeholder="e.g. Midnight Black, Silver"
                  value={form.color} onChange={e => update('color', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Estimated Value (MWK)</label>
                <input className="field-input" type="number" placeholder="e.g. 250000"
                  value={form.estimatedValueMWK} onChange={e => update('estimatedValueMWK', e.target.value)} />
                <div className="field-hint">Used for insurance and recovery prioritisation</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label className="field-label">Date of Purchase</label>
                <input className="field-input" type="date"
                  value={form.purchaseDate} onChange={e => update('purchaseDate', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Place of Purchase</label>
                <input className="field-input" placeholder="e.g. Chisomo Electronics, City Mall"
                  value={form.purchasePlace} onChange={e => update('purchasePlace', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3 — DEVICE IDENTIFIERS
        ══════════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            <SectionTitle color="var(--blue)">🔢 Device Identifiers</SectionTitle>

            <div className="alert alert-amber" style={{ marginBottom:16 }}>
              <span className="alert-icon">💡</span>
              <div>These numbers uniquely identify your device on any network. Enter as many as possible — the more identifiers registered, the harder the device is to sell if stolen.</div>
            </div>

            {showImei && (
              <>
                <div className="field">
                  <label className="field-label">IMEI Number — SIM Slot 1 *</label>
                  <input className="field-input mono" placeholder="15-digit IMEI — dial *#06# to find it"
                    value={form.imei} onChange={e => update('imei', e.target.value)} />
                  <div className="field-hint">Dial *#06# — the IMEI appears on screen immediately.</div>
                </div>
                <div className="field">
                  <label className="field-label">IMEI Number — SIM Slot 2 (dual-SIM phones)</label>
                  <input className="field-input mono" placeholder="Second IMEI if your phone has 2 SIM slots"
                    value={form.imei2} onChange={e => update('imei2', e.target.value)} />
                </div>
              </>
            )}

            {showMac && (
              <div className="field">
                <label className="field-label">WiFi MAC Address</label>
                <input className="field-input mono" placeholder="e.g. A4:C3:F0:85:AC:12"
                  value={form.mac} onChange={e => update('mac', e.target.value)} />
                <div className="field-hint">Settings → About → WiFi → MAC Address. Enables tracking on WiFi networks.</div>
              </div>
            )}

            <div className="field">
              <label className="field-label">Serial Number</label>
              <input className="field-input mono" placeholder="Found on box, back sticker, or Settings → About"
                value={form.serial} onChange={e => update('serial', e.target.value)} />
            </div>

            {/* Registration summary preview */}
            <div style={{ background:'var(--bg)', borderRadius:'var(--radius-2)', padding:'14px 16px', marginTop:8 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', marginBottom:10, letterSpacing:1, textTransform:'uppercase' }}>
                Registration Summary
              </div>
              <div className="grid-2" style={{ gap:10 }}>
                {[
                  ['Owner',         form.ownerFullName],
                  ['Phone',         form.ownerPhone],
                  ['NRC / ID',      form.ownerIdNumber],
                  ['District',      form.ownerDistrict],
                  ['Device',        `${form.make} ${form.model}`.trim()],
                  ['Ref. Contact',  form.refName],
                  ['Ref. Phone',    form.refPhone],
                ].filter(([,v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{k}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-2)', marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="alert alert-green" style={{ marginTop:14 }}>
              <span className="alert-icon">🔒</span>
              <div>
                Owner details are <strong>confidential</strong>. The public IMEI checker shows only clean/stolen status.
                Full owner profile is visible only to verified <strong>police officers</strong> and <strong>MACRA administrators</strong>.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer navigation ── */}
      <div className="modal-footer">
        <button className="btn btn-surface" onClick={onClose}>Cancel</button>
        {step > 1 && (
          <button className="btn btn-surface" onClick={handleBack}>← Back</button>
        )}
        {step < 3 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Next: {STEPS[step].label} →
          </button>
        ) : (
          <button className="btn btn-green" onClick={handleSubmit}>
            ✅ Complete Registration
          </button>
        )}
      </div>
    </Modal>
  );
}

/* Small helper for section headings inside the form */
function SectionTitle({ children, color, top }) {
  return (
    <div style={{
      fontSize:11, fontWeight:800, color, letterSpacing:1.5,
      textTransform:'uppercase', marginTop: top ? 20 : 0,
      marginBottom:14, paddingBottom:8,
      borderBottom:'1px solid var(--muted-3)',
    }}>
      {children}
    </div>
  );
}
