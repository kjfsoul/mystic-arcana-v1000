'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelestialEventType, ProductMetadata } from '@/lib/stripe/initStripe';
import styles from './FilterSidebar.module.css';
export interface FilterState {
  celestialEvents: CelestialEventType[];
  productTypes: ProductMetadata['type'][];
  elements: ('fire' | 'earth' | 'air' | 'water')[];
  moonPhases: ('waxing' | 'full' | 'waning' | 'new')[];
  priceRange: [number, number];
  showLimitedEdition: boolean;
}
interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  productCount: number;
}
const CELESTIAL_EVENTS: { value: CelestialEventType; label: string; emoji: string }[] = [
  { value: 'mercury_retrograde', label: 'Mercury Retrograde', emoji: '☿' },
  { value: 'full_moon', label: 'Full Moon', emoji: '🌕' },
  { value: 'new_moon', label: 'New Moon', emoji: '🌑' },
  { value: 'eclipse', label: 'Eclipse', emoji: '🌘' },
  { value: 'conjunction', label: 'Planetary Conjunction', emoji: '🪐' },
  { value: 'solstice', label: 'Solstice', emoji: '☀️' },
  { value: 'equinox', label: 'Equinox', emoji: '⚖️' },
  { value: 'saturn_return', label: 'Saturn Return', emoji: '🪐' },
  { value: 'venus_retrograde', label: 'Venus Retrograde', emoji: '♀' },
  { value: 'mars_retrograde', label: 'Mars Retrograde', emoji: '♂' }
];
const PRODUCT_TYPES: { value: ProductMetadata['type']; label: string; emoji: string }[] = [
  { value: 'fashion', label: 'Fashion', emoji: '👗' },
  { value: 'crystals', label: 'Crystals', emoji: '💎' },
  { value: 'tarot', label: 'Tarot', emoji: '🔮' },
  { value: 'jewelry', label: 'Jewelry', emoji: '💍' },
  { value: 'candles', label: 'Candles', emoji: '🕯️' },
  { value: 'books', label: 'Books', emoji: '📚' },
  { value: 'oils', label: 'Oils', emoji: '🧴' }
];
const ELEMENTS: { value: 'fire' | 'earth' | 'air' | 'water'; label: string; emoji: string }[] = [
  { value: 'fire', label: 'Fire', emoji: '🔥' },
  { value: 'earth', label: 'Earth', emoji: '🌍' },
  { value: 'air', label: 'Air', emoji: '💨' },
  { value: 'water', label: 'Water', emoji: '💧' }
];
const MOON_PHASES: { value: 'waxing' | 'full' | 'waning' | 'new'; label: string; emoji: string }[] = [
  { value: 'waxing', label: 'Waxing', emoji: '🌒' },
  { value: 'full', label: 'Full', emoji: '🌕' },
  { value: 'waning', label: 'Waning', emoji: '🌘' },
  { value: 'new', label: 'New', emoji: '🌑' }
];
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  productCount
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['celestialEvents', 'productTypes'])
  );
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  const toggleArrayFilter = <T,>(
    currentArray: T[],
    value: T,
    key: keyof FilterState
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterState[typeof key]);
  };
  const clearAllFilters = () => {
    onFiltersChange({
      celestialEvents: [],
      productTypes: [],
      elements: [],
      moonPhases: [],
      priceRange: [0, 10000],
      showLimitedEdition: false
    });
  };
  const FilterSection: React.FC<{
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }> = ({ title, sectionKey, children }) => (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionHeader}
        onClick={() => toggleSection(sectionKey)}
      >
        <span className={styles.sectionTitle}>{title}</span>
        <motion.span
          className={styles.expandIcon}
          animate={{ rotate: expandedSections.has(sectionKey) ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {expandedSections.has(sectionKey) && (
          <motion.div
            className={styles.sectionContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  const CheckboxFilter: React.FC<{
    items: { value: any; label: string; emoji: string }[];
    selectedItems: any[];
    onToggle: (value: any) => void;
  }> = ({ items, selectedItems, onToggle }) => (
    <div className={styles.checkboxGrid}>
      {items.map(item => (
        <motion.label
          key={item.value}
          className={`${styles.checkboxItem} ${
            selectedItems.includes(item.value) ? styles.checked : ''
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="checkbox"
            checked={selectedItems.includes(item.value)}
            onChange={() => onToggle(item.value)}
            className={styles.hiddenCheckbox}
          />
          <span className={styles.checkboxEmoji}>{item.emoji}</span>
          <span className={styles.checkboxLabel}>{item.label}</span>
        </motion.label>
      ))}
    </div>
  );
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <motion.div
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            ✨ Cosmic Filters
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        <div className={styles.sidebarContent}>
          <div className={styles.resultsCounter}>
            {productCount} cosmic treasures found
          </div>
          <FilterSection title="🌟 Celestial Events" sectionKey="celestialEvents">
            <CheckboxFilter
              items={CELESTIAL_EVENTS}
              selectedItems={filters.celestialEvents}
              onToggle={(value) => toggleArrayFilter(filters.celestialEvents, value, 'celestialEvents')}
            />
          </FilterSection>
          <FilterSection title="🛍️ Product Types" sectionKey="productTypes">
            <CheckboxFilter
              items={PRODUCT_TYPES}
              selectedItems={filters.productTypes}
              onToggle={(value) => toggleArrayFilter(filters.productTypes, value, 'productTypes')}
            />
          </FilterSection>
          <FilterSection title="🌈 Elements" sectionKey="elements">
            <CheckboxFilter
              items={ELEMENTS}
              selectedItems={filters.elements}
              onToggle={(value) => toggleArrayFilter(filters.elements, value, 'elements')}
            />
          </FilterSection>
          <FilterSection title="🌙 Moon Phases" sectionKey="moonPhases">
            <CheckboxFilter
              items={MOON_PHASES}
              selectedItems={filters.moonPhases}
              onToggle={(value) => toggleArrayFilter(filters.moonPhases, value, 'moonPhases')}
            />
          </FilterSection>
          <FilterSection title="💰 Price Range" sectionKey="priceRange">
            <div className={styles.priceRange}>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  value={filters.priceRange[0] / 100}
                  onChange={(e) => updateFilter('priceRange', [
                    parseInt(e.target.value) * 100 || 0,
                    filters.priceRange[1]
                  ])}
                  className={styles.priceInput}
                  placeholder="Min"
                />
                <span className={styles.priceSeparator}>-</span>
                <input
                  type="number"
                  value={filters.priceRange[1] / 100}
                  onChange={(e) => updateFilter('priceRange', [
                    filters.priceRange[0],
                    parseInt(e.target.value) * 100 || 10000
                  ])}
                  className={styles.priceInput}
                  placeholder="Max"
                />
              </div>
            </div>
          </FilterSection>
          <FilterSection title="⭐ Special" sectionKey="special">
            <motion.label
              className={`${styles.toggleItem} ${
                filters.showLimitedEdition ? styles.checked : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={filters.showLimitedEdition}
                onChange={(e) => updateFilter('showLimitedEdition', e.target.checked)}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.toggleEmoji}>💫</span>
              <span className={styles.toggleLabel}>Limited Edition Only</span>
            </motion.label>
          </FilterSection>
        </div>
        <div className={styles.sidebarFooter}>
          <motion.button
            className={styles.clearButton}
            onClick={clearAllFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All Filters
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};
