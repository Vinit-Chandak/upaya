'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

const RELATIONSHIPS = [
  { value: 'spouse', hi: 'पति/पत्नी', en: 'Spouse' },
  { value: 'son', hi: 'पुत्र', en: 'Son' },
  { value: 'daughter', hi: 'पुत्री', en: 'Daughter' },
  { value: 'father', hi: 'पिता', en: 'Father' },
  { value: 'mother', hi: 'माता', en: 'Mother' },
  { value: 'brother', hi: 'भाई', en: 'Brother' },
  { value: 'sister', hi: 'बहन', en: 'Sister' },
  { value: 'other', hi: 'अन्य', en: 'Other' },
];

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  relationshipHi: string;
  dob: string;
  hasKundli: boolean;
}

const MOCK_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Priya Sharma',
    relationship: 'Spouse',
    relationshipHi: 'पत्नी',
    dob: '1994-06-15',
    hasKundli: true,
  },
  {
    id: 'm2',
    name: 'Arjun Sharma',
    relationship: 'Son',
    relationshipHi: 'पुत्र',
    dob: '2018-11-03',
    hasKundli: false,
  },
];

export default function FamilyVaultPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [members] = useState<FamilyMember[]>(MOCK_MEMBERS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dob: '',
    tob: '',
    tobApproximate: false,
    pob: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call the API to generate kundli
    alert(language === 'hi' ? 'कुंडली जनरेट हो रही है...' : 'Generating kundli...');
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'फैमिली कुंडली वॉल्ट' : 'Family Kundli Vault'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Subtitle */}
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>
              {language === 'hi' ? 'परिवार की कुंडलियां एक जगह' : 'All family kundlis in one place'}
            </h1>
            <p className={styles.headerSub}>
              {language === 'hi'
                ? 'परिवार के सदस्यों की कुंडली यहां सुरक्षित रखें'
                : 'Keep your family members\' kundlis safe here'}
            </p>
          </div>

          {/* Family Members List */}
          {members.length > 0 ? (
            <div className={styles.memberGrid}>
              {members.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.memberAvatar}>
                    {getInitial(member.name)}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRelation}>
                      {language === 'hi' ? member.relationshipHi : member.relationship}
                    </span>
                    <span className={styles.memberDob}>
                      {language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} {member.dob}
                    </span>
                  </div>
                  <button className={styles.viewKundliBtn}>
                    {member.hasKundli
                      ? (language === 'hi' ? 'कुंडली देखें \u2192' : 'View Kundli \u2192')
                      : (language === 'hi' ? 'कुंडली बनाएं \u2192' : 'Generate Kundli \u2192')
                    }
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66</span>
              <p className={styles.emptyTitle}>
                {language === 'hi'
                  ? 'अभी कोई सदस्य नहीं है'
                  : 'No family members yet'}
              </p>
              <p className={styles.emptyText}>
                {language === 'hi'
                  ? 'अपने परिवार के सदस्यों को जोड़ें और उनकी कुंडली बनवाएं'
                  : 'Add your family members and generate their kundlis'}
              </p>
              <button
                className={styles.emptyCtaButton}
                onClick={() => setShowForm(true)}
              >
                {language === 'hi' ? '+ सदस्य जोड़ें' : '+ Add Member'}
              </button>
            </div>
          )}

          {/* Add Member Floating Button */}
          {!showForm && members.length > 0 && (
            <button
              className={styles.floatingAddBtn}
              onClick={() => setShowForm(true)}
              aria-label={language === 'hi' ? 'सदस्य जोड़ें' : 'Add family member'}
            >
              <span className={styles.floatingAddIcon}>+</span>
              <span className={styles.floatingAddText}>
                {language === 'hi' ? 'सदस्य जोड़ें' : 'Add Member'}
              </span>
            </button>
          )}

          {/* Add Member Form */}
          {showForm && (
            <section className={styles.formSection}>
              <div className={styles.formHeader}>
                <h2 className={styles.sectionTitle}>
                  {language === 'hi' ? 'नया सदस्य जोड़ें' : 'Add New Member'}
                </h2>
                <button
                  className={styles.formCloseBtn}
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  \u2715
                </button>
              </div>

              <form className={styles.form} onSubmit={handleFormSubmit}>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'नाम' : 'Name'}
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Relationship */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'रिश्ता' : 'Relationship'}
                  </label>
                  <select
                    className={styles.formSelect}
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {language === 'hi' ? 'रिश्ता चुनें' : 'Select relationship'}
                    </option>
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel.value} value={rel.value}>
                        {language === 'hi' ? rel.hi : rel.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date of Birth */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
                </div>

                {/* Time of Birth */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'जन्म समय' : 'Time of Birth'}
                    <span className={styles.formOptional}>
                      ({language === 'hi' ? 'वैकल्पिक' : 'optional'})
                    </span>
                  </label>
                  <input
                    type="time"
                    className={styles.formInput}
                    value={formData.tob}
                    onChange={(e) => handleInputChange('tob', e.target.value)}
                  />
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.tobApproximate}
                      onChange={(e) => handleInputChange('tobApproximate', e.target.checked)}
                    />
                    <span className={styles.checkboxText}>
                      {language === 'hi' ? 'अनुमानित समय' : 'Approximate time'}
                    </span>
                  </label>
                </div>

                {/* Place of Birth */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'जन्म स्थान' : 'Place of Birth'}
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={language === 'hi' ? 'शहर का नाम दर्ज करें' : 'Enter city name'}
                    value={formData.pob}
                    onChange={(e) => handleInputChange('pob', e.target.value)}
                    required
                  />
                </div>

                {/* Submit */}
                <button type="submit" className={styles.generateCta}>
                  {language === 'hi' ? 'कुंडली बनाएं' : 'Generate Kundli'}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
