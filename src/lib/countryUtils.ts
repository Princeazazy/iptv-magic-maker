// Comprehensive country mapping with priority ordering
// Arabic-speaking countries first, then USA, then by alphabet

export interface CountryInfo {
  name: string;
  code: string;
  flagUrl: string;
  priority: number; // Lower = higher priority
}

// Arabic-speaking countries (priority 1-20)
const ARABIC_COUNTRIES: Record<string, CountryInfo> = {
  'ar': { name: 'Arabic', code: 'sa', flagUrl: 'https://flagcdn.com/w80/sa.png', priority: 1 },
  'arabic': { name: 'Arabic', code: 'sa', flagUrl: 'https://flagcdn.com/w80/sa.png', priority: 1 },
  'sa': { name: 'Saudi Arabia', code: 'sa', flagUrl: 'https://flagcdn.com/w80/sa.png', priority: 2 },
  'saudi': { name: 'Saudi Arabia', code: 'sa', flagUrl: 'https://flagcdn.com/w80/sa.png', priority: 2 },
  'ae': { name: 'UAE', code: 'ae', flagUrl: 'https://flagcdn.com/w80/ae.png', priority: 3 },
  'uae': { name: 'UAE', code: 'ae', flagUrl: 'https://flagcdn.com/w80/ae.png', priority: 3 },
  'emirates': { name: 'UAE', code: 'ae', flagUrl: 'https://flagcdn.com/w80/ae.png', priority: 3 },
  'eg': { name: 'Egypt', code: 'eg', flagUrl: 'https://flagcdn.com/w80/eg.png', priority: 4 },
  'egypt': { name: 'Egypt', code: 'eg', flagUrl: 'https://flagcdn.com/w80/eg.png', priority: 4 },
  'jo': { name: 'Jordan', code: 'jo', flagUrl: 'https://flagcdn.com/w80/jo.png', priority: 5 },
  'jordan': { name: 'Jordan', code: 'jo', flagUrl: 'https://flagcdn.com/w80/jo.png', priority: 5 },
  'lb': { name: 'Lebanon', code: 'lb', flagUrl: 'https://flagcdn.com/w80/lb.png', priority: 6 },
  'lebanon': { name: 'Lebanon', code: 'lb', flagUrl: 'https://flagcdn.com/w80/lb.png', priority: 6 },
  'sy': { name: 'Syria', code: 'sy', flagUrl: 'https://flagcdn.com/w80/sy.png', priority: 7 },
  'syria': { name: 'Syria', code: 'sy', flagUrl: 'https://flagcdn.com/w80/sy.png', priority: 7 },
  'iq': { name: 'Iraq', code: 'iq', flagUrl: 'https://flagcdn.com/w80/iq.png', priority: 8 },
  'iraq': { name: 'Iraq', code: 'iq', flagUrl: 'https://flagcdn.com/w80/iq.png', priority: 8 },
  'kw': { name: 'Kuwait', code: 'kw', flagUrl: 'https://flagcdn.com/w80/kw.png', priority: 9 },
  'kuwait': { name: 'Kuwait', code: 'kw', flagUrl: 'https://flagcdn.com/w80/kw.png', priority: 9 },
  'qa': { name: 'Qatar', code: 'qa', flagUrl: 'https://flagcdn.com/w80/qa.png', priority: 10 },
  'qatar': { name: 'Qatar', code: 'qa', flagUrl: 'https://flagcdn.com/w80/qa.png', priority: 10 },
  'bh': { name: 'Bahrain', code: 'bh', flagUrl: 'https://flagcdn.com/w80/bh.png', priority: 11 },
  'bahrain': { name: 'Bahrain', code: 'bh', flagUrl: 'https://flagcdn.com/w80/bh.png', priority: 11 },
  'om': { name: 'Oman', code: 'om', flagUrl: 'https://flagcdn.com/w80/om.png', priority: 12 },
  'oman': { name: 'Oman', code: 'om', flagUrl: 'https://flagcdn.com/w80/om.png', priority: 12 },
  'ye': { name: 'Yemen', code: 'ye', flagUrl: 'https://flagcdn.com/w80/ye.png', priority: 13 },
  'yemen': { name: 'Yemen', code: 'ye', flagUrl: 'https://flagcdn.com/w80/ye.png', priority: 13 },
  'ps': { name: 'Palestine', code: 'ps', flagUrl: 'https://flagcdn.com/w80/ps.png', priority: 14 },
  'palestine': { name: 'Palestine', code: 'ps', flagUrl: 'https://flagcdn.com/w80/ps.png', priority: 14 },
  'ma': { name: 'Morocco', code: 'ma', flagUrl: 'https://flagcdn.com/w80/ma.png', priority: 15 },
  'morocco': { name: 'Morocco', code: 'ma', flagUrl: 'https://flagcdn.com/w80/ma.png', priority: 15 },
  'dz': { name: 'Algeria', code: 'dz', flagUrl: 'https://flagcdn.com/w80/dz.png', priority: 16 },
  'algeria': { name: 'Algeria', code: 'dz', flagUrl: 'https://flagcdn.com/w80/dz.png', priority: 16 },
  'tn': { name: 'Tunisia', code: 'tn', flagUrl: 'https://flagcdn.com/w80/tn.png', priority: 17 },
  'tunisia': { name: 'Tunisia', code: 'tn', flagUrl: 'https://flagcdn.com/w80/tn.png', priority: 17 },
  'ly': { name: 'Libya', code: 'ly', flagUrl: 'https://flagcdn.com/w80/ly.png', priority: 18 },
  'libya': { name: 'Libya', code: 'ly', flagUrl: 'https://flagcdn.com/w80/ly.png', priority: 18 },
  'sd': { name: 'Sudan', code: 'sd', flagUrl: 'https://flagcdn.com/w80/sd.png', priority: 19 },
  'sudan': { name: 'Sudan', code: 'sd', flagUrl: 'https://flagcdn.com/w80/sd.png', priority: 19 },
  'so': { name: 'Somalia', code: 'so', flagUrl: 'https://flagcdn.com/w80/so.png', priority: 20 },
  'somalia': { name: 'Somalia', code: 'so', flagUrl: 'https://flagcdn.com/w80/so.png', priority: 20 },
};

// USA (priority 25)
const USA_ENTRY: Record<string, CountryInfo> = {
  'us': { name: 'United States', code: 'us', flagUrl: 'https://flagcdn.com/w80/us.png', priority: 25 },
  'usa': { name: 'United States', code: 'us', flagUrl: 'https://flagcdn.com/w80/us.png', priority: 25 },
  'united states': { name: 'United States', code: 'us', flagUrl: 'https://flagcdn.com/w80/us.png', priority: 25 },
  'america': { name: 'United States', code: 'us', flagUrl: 'https://flagcdn.com/w80/us.png', priority: 25 },
};

// Other countries (priority 50+)
const OTHER_COUNTRIES: Record<string, CountryInfo> = {
  'uk': { name: 'United Kingdom', code: 'gb', flagUrl: 'https://flagcdn.com/w80/gb.png', priority: 50 },
  'gb': { name: 'United Kingdom', code: 'gb', flagUrl: 'https://flagcdn.com/w80/gb.png', priority: 50 },
  'england': { name: 'United Kingdom', code: 'gb', flagUrl: 'https://flagcdn.com/w80/gb.png', priority: 50 },
  'de': { name: 'Germany', code: 'de', flagUrl: 'https://flagcdn.com/w80/de.png', priority: 51 },
  'germany': { name: 'Germany', code: 'de', flagUrl: 'https://flagcdn.com/w80/de.png', priority: 51 },
  'fr': { name: 'France', code: 'fr', flagUrl: 'https://flagcdn.com/w80/fr.png', priority: 52 },
  'france': { name: 'France', code: 'fr', flagUrl: 'https://flagcdn.com/w80/fr.png', priority: 52 },
  'es': { name: 'Spain', code: 'es', flagUrl: 'https://flagcdn.com/w80/es.png', priority: 53 },
  'spain': { name: 'Spain', code: 'es', flagUrl: 'https://flagcdn.com/w80/es.png', priority: 53 },
  'it': { name: 'Italy', code: 'it', flagUrl: 'https://flagcdn.com/w80/it.png', priority: 54 },
  'italy': { name: 'Italy', code: 'it', flagUrl: 'https://flagcdn.com/w80/it.png', priority: 54 },
  'pt': { name: 'Portugal', code: 'pt', flagUrl: 'https://flagcdn.com/w80/pt.png', priority: 55 },
  'portugal': { name: 'Portugal', code: 'pt', flagUrl: 'https://flagcdn.com/w80/pt.png', priority: 55 },
  'nl': { name: 'Netherlands', code: 'nl', flagUrl: 'https://flagcdn.com/w80/nl.png', priority: 56 },
  'netherlands': { name: 'Netherlands', code: 'nl', flagUrl: 'https://flagcdn.com/w80/nl.png', priority: 56 },
  'be': { name: 'Belgium', code: 'be', flagUrl: 'https://flagcdn.com/w80/be.png', priority: 57 },
  'belgium': { name: 'Belgium', code: 'be', flagUrl: 'https://flagcdn.com/w80/be.png', priority: 57 },
  'ch': { name: 'Switzerland', code: 'ch', flagUrl: 'https://flagcdn.com/w80/ch.png', priority: 58 },
  'switzerland': { name: 'Switzerland', code: 'ch', flagUrl: 'https://flagcdn.com/w80/ch.png', priority: 58 },
  'at': { name: 'Austria', code: 'at', flagUrl: 'https://flagcdn.com/w80/at.png', priority: 59 },
  'austria': { name: 'Austria', code: 'at', flagUrl: 'https://flagcdn.com/w80/at.png', priority: 59 },
  'pl': { name: 'Poland', code: 'pl', flagUrl: 'https://flagcdn.com/w80/pl.png', priority: 60 },
  'poland': { name: 'Poland', code: 'pl', flagUrl: 'https://flagcdn.com/w80/pl.png', priority: 60 },
  'ru': { name: 'Russia', code: 'ru', flagUrl: 'https://flagcdn.com/w80/ru.png', priority: 61 },
  'russia': { name: 'Russia', code: 'ru', flagUrl: 'https://flagcdn.com/w80/ru.png', priority: 61 },
  'ua': { name: 'Ukraine', code: 'ua', flagUrl: 'https://flagcdn.com/w80/ua.png', priority: 62 },
  'ukraine': { name: 'Ukraine', code: 'ua', flagUrl: 'https://flagcdn.com/w80/ua.png', priority: 62 },
  'tr': { name: 'Turkey', code: 'tr', flagUrl: 'https://flagcdn.com/w80/tr.png', priority: 63 },
  'turkey': { name: 'Turkey', code: 'tr', flagUrl: 'https://flagcdn.com/w80/tr.png', priority: 63 },
  'in': { name: 'India', code: 'in', flagUrl: 'https://flagcdn.com/w80/in.png', priority: 64 },
  'india': { name: 'India', code: 'in', flagUrl: 'https://flagcdn.com/w80/in.png', priority: 64 },
  'pk': { name: 'Pakistan', code: 'pk', flagUrl: 'https://flagcdn.com/w80/pk.png', priority: 65 },
  'pakistan': { name: 'Pakistan', code: 'pk', flagUrl: 'https://flagcdn.com/w80/pk.png', priority: 65 },
  'bd': { name: 'Bangladesh', code: 'bd', flagUrl: 'https://flagcdn.com/w80/bd.png', priority: 66 },
  'bangladesh': { name: 'Bangladesh', code: 'bd', flagUrl: 'https://flagcdn.com/w80/bd.png', priority: 66 },
  'cn': { name: 'China', code: 'cn', flagUrl: 'https://flagcdn.com/w80/cn.png', priority: 67 },
  'china': { name: 'China', code: 'cn', flagUrl: 'https://flagcdn.com/w80/cn.png', priority: 67 },
  'jp': { name: 'Japan', code: 'jp', flagUrl: 'https://flagcdn.com/w80/jp.png', priority: 68 },
  'japan': { name: 'Japan', code: 'jp', flagUrl: 'https://flagcdn.com/w80/jp.png', priority: 68 },
  'kr': { name: 'South Korea', code: 'kr', flagUrl: 'https://flagcdn.com/w80/kr.png', priority: 69 },
  'korea': { name: 'South Korea', code: 'kr', flagUrl: 'https://flagcdn.com/w80/kr.png', priority: 69 },
  'th': { name: 'Thailand', code: 'th', flagUrl: 'https://flagcdn.com/w80/th.png', priority: 70 },
  'thailand': { name: 'Thailand', code: 'th', flagUrl: 'https://flagcdn.com/w80/th.png', priority: 70 },
  'ph': { name: 'Philippines', code: 'ph', flagUrl: 'https://flagcdn.com/w80/ph.png', priority: 71 },
  'philippines': { name: 'Philippines', code: 'ph', flagUrl: 'https://flagcdn.com/w80/ph.png', priority: 71 },
  'id': { name: 'Indonesia', code: 'id', flagUrl: 'https://flagcdn.com/w80/id.png', priority: 72 },
  'indonesia': { name: 'Indonesia', code: 'id', flagUrl: 'https://flagcdn.com/w80/id.png', priority: 72 },
  'my': { name: 'Malaysia', code: 'my', flagUrl: 'https://flagcdn.com/w80/my.png', priority: 73 },
  'malaysia': { name: 'Malaysia', code: 'my', flagUrl: 'https://flagcdn.com/w80/my.png', priority: 73 },
  'vn': { name: 'Vietnam', code: 'vn', flagUrl: 'https://flagcdn.com/w80/vn.png', priority: 74 },
  'vietnam': { name: 'Vietnam', code: 'vn', flagUrl: 'https://flagcdn.com/w80/vn.png', priority: 74 },
  'au': { name: 'Australia', code: 'au', flagUrl: 'https://flagcdn.com/w80/au.png', priority: 75 },
  'australia': { name: 'Australia', code: 'au', flagUrl: 'https://flagcdn.com/w80/au.png', priority: 75 },
  'nz': { name: 'New Zealand', code: 'nz', flagUrl: 'https://flagcdn.com/w80/nz.png', priority: 76 },
  'new zealand': { name: 'New Zealand', code: 'nz', flagUrl: 'https://flagcdn.com/w80/nz.png', priority: 76 },
  'ca': { name: 'Canada', code: 'ca', flagUrl: 'https://flagcdn.com/w80/ca.png', priority: 77 },
  'canada': { name: 'Canada', code: 'ca', flagUrl: 'https://flagcdn.com/w80/ca.png', priority: 77 },
  'mx': { name: 'Mexico', code: 'mx', flagUrl: 'https://flagcdn.com/w80/mx.png', priority: 78 },
  'mexico': { name: 'Mexico', code: 'mx', flagUrl: 'https://flagcdn.com/w80/mx.png', priority: 78 },
  'br': { name: 'Brazil', code: 'br', flagUrl: 'https://flagcdn.com/w80/br.png', priority: 79 },
  'brazil': { name: 'Brazil', code: 'br', flagUrl: 'https://flagcdn.com/w80/br.png', priority: 79 },
  'arg': { name: 'Argentina', code: 'ar', flagUrl: 'https://flagcdn.com/w80/ar.png', priority: 80 },
  'argentina': { name: 'Argentina', code: 'ar', flagUrl: 'https://flagcdn.com/w80/ar.png', priority: 80 },
  'co': { name: 'Colombia', code: 'co', flagUrl: 'https://flagcdn.com/w80/co.png', priority: 81 },
  'colombia': { name: 'Colombia', code: 'co', flagUrl: 'https://flagcdn.com/w80/co.png', priority: 81 },
  'cl': { name: 'Chile', code: 'cl', flagUrl: 'https://flagcdn.com/w80/cl.png', priority: 82 },
  'chile': { name: 'Chile', code: 'cl', flagUrl: 'https://flagcdn.com/w80/cl.png', priority: 82 },
  'pe': { name: 'Peru', code: 'pe', flagUrl: 'https://flagcdn.com/w80/pe.png', priority: 83 },
  'peru': { name: 'Peru', code: 'pe', flagUrl: 'https://flagcdn.com/w80/pe.png', priority: 83 },
  've': { name: 'Venezuela', code: 've', flagUrl: 'https://flagcdn.com/w80/ve.png', priority: 84 },
  'venezuela': { name: 'Venezuela', code: 've', flagUrl: 'https://flagcdn.com/w80/ve.png', priority: 84 },
  'za': { name: 'South Africa', code: 'za', flagUrl: 'https://flagcdn.com/w80/za.png', priority: 85 },
  'south africa': { name: 'South Africa', code: 'za', flagUrl: 'https://flagcdn.com/w80/za.png', priority: 85 },
  'ng': { name: 'Nigeria', code: 'ng', flagUrl: 'https://flagcdn.com/w80/ng.png', priority: 86 },
  'nigeria': { name: 'Nigeria', code: 'ng', flagUrl: 'https://flagcdn.com/w80/ng.png', priority: 86 },
  'ke': { name: 'Kenya', code: 'ke', flagUrl: 'https://flagcdn.com/w80/ke.png', priority: 87 },
  'kenya': { name: 'Kenya', code: 'ke', flagUrl: 'https://flagcdn.com/w80/ke.png', priority: 87 },
  'gh': { name: 'Ghana', code: 'gh', flagUrl: 'https://flagcdn.com/w80/gh.png', priority: 88 },
  'ghana': { name: 'Ghana', code: 'gh', flagUrl: 'https://flagcdn.com/w80/gh.png', priority: 88 },
  'il': { name: 'Israel', code: 'il', flagUrl: 'https://flagcdn.com/w80/il.png', priority: 89 },
  'israel': { name: 'Israel', code: 'il', flagUrl: 'https://flagcdn.com/w80/il.png', priority: 89 },
  'ir': { name: 'Iran', code: 'ir', flagUrl: 'https://flagcdn.com/w80/ir.png', priority: 90 },
  'iran': { name: 'Iran', code: 'ir', flagUrl: 'https://flagcdn.com/w80/ir.png', priority: 90 },
  'af': { name: 'Afghanistan', code: 'af', flagUrl: 'https://flagcdn.com/w80/af.png', priority: 91 },
  'afghanistan': { name: 'Afghanistan', code: 'af', flagUrl: 'https://flagcdn.com/w80/af.png', priority: 91 },
  'gr': { name: 'Greece', code: 'gr', flagUrl: 'https://flagcdn.com/w80/gr.png', priority: 92 },
  'greece': { name: 'Greece', code: 'gr', flagUrl: 'https://flagcdn.com/w80/gr.png', priority: 92 },
  'se': { name: 'Sweden', code: 'se', flagUrl: 'https://flagcdn.com/w80/se.png', priority: 93 },
  'sweden': { name: 'Sweden', code: 'se', flagUrl: 'https://flagcdn.com/w80/se.png', priority: 93 },
  'no': { name: 'Norway', code: 'no', flagUrl: 'https://flagcdn.com/w80/no.png', priority: 94 },
  'norway': { name: 'Norway', code: 'no', flagUrl: 'https://flagcdn.com/w80/no.png', priority: 94 },
  'dk': { name: 'Denmark', code: 'dk', flagUrl: 'https://flagcdn.com/w80/dk.png', priority: 95 },
  'denmark': { name: 'Denmark', code: 'dk', flagUrl: 'https://flagcdn.com/w80/dk.png', priority: 95 },
  'fi': { name: 'Finland', code: 'fi', flagUrl: 'https://flagcdn.com/w80/fi.png', priority: 96 },
  'finland': { name: 'Finland', code: 'fi', flagUrl: 'https://flagcdn.com/w80/fi.png', priority: 96 },
  'ie': { name: 'Ireland', code: 'ie', flagUrl: 'https://flagcdn.com/w80/ie.png', priority: 97 },
  'ireland': { name: 'Ireland', code: 'ie', flagUrl: 'https://flagcdn.com/w80/ie.png', priority: 97 },
  'cz': { name: 'Czech Republic', code: 'cz', flagUrl: 'https://flagcdn.com/w80/cz.png', priority: 98 },
  'czech': { name: 'Czech Republic', code: 'cz', flagUrl: 'https://flagcdn.com/w80/cz.png', priority: 98 },
  'hu': { name: 'Hungary', code: 'hu', flagUrl: 'https://flagcdn.com/w80/hu.png', priority: 99 },
  'hungary': { name: 'Hungary', code: 'hu', flagUrl: 'https://flagcdn.com/w80/hu.png', priority: 99 },
  'ro': { name: 'Romania', code: 'ro', flagUrl: 'https://flagcdn.com/w80/ro.png', priority: 100 },
  'romania': { name: 'Romania', code: 'ro', flagUrl: 'https://flagcdn.com/w80/ro.png', priority: 100 },
};

// Merged all countries
const ALL_COUNTRIES = { ...ARABIC_COUNTRIES, ...USA_ENTRY, ...OTHER_COUNTRIES };

// Get country info from group name
export const getCountryInfo = (group: string): CountryInfo | null => {
  const groupLower = group.toLowerCase().trim();

  // Direct match first (highest priority)
  if (ALL_COUNTRIES[groupLower]) {
    return ALL_COUNTRIES[groupLower];
  }

  // Check for full country name matches FIRST (before partial matching)
  // This ensures "United Kingdom" matches UK, not "om" from Oman
  for (const [key, info] of Object.entries(ALL_COUNTRIES)) {
    // Only match if the full country name is found as a complete match
    if (groupLower === info.name.toLowerCase()) {
      return info;
    }
  }

  // Check if group starts with country code (e.g., "US | News", "AR: Sports")
  const codeMatch = groupLower.match(/^([a-z]{2})[\s|:\-]/);
  if (codeMatch && ALL_COUNTRIES[codeMatch[1]]) {
    return ALL_COUNTRIES[codeMatch[1]];
  }

  // Check if country name appears as a whole word in group name
  // Use word boundaries to prevent "om" matching "kingdom"
  for (const [key, info] of Object.entries(ALL_COUNTRIES)) {
    const countryName = info.name.toLowerCase();
    // Check if country name appears as whole word(s)
    const nameRegex = new RegExp(`\\b${countryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (nameRegex.test(groupLower)) {
      return info;
    }
    // Check if key (like "uk", "usa") appears as whole word, but only for keys 3+ chars to avoid false matches
    if (key.length >= 3) {
      const keyRegex = new RegExp(`\\b${key}\\b`, 'i');
      if (keyRegex.test(groupLower)) {
        return info;
      }
    }
  }

  // For 2-letter codes, only match at start or after separator
  const twoLetterMatch = groupLower.match(/^([a-z]{2})(?:\s|$|[|:\-])/);
  if (twoLetterMatch && ALL_COUNTRIES[twoLetterMatch[1]]) {
    return ALL_COUNTRIES[twoLetterMatch[1]];
  }

  return null;
};

// Normalize a group name to a canonical country key for merging duplicates
// Returns the country code if it's a recognized country, otherwise the original group name
export const normalizeGroupName = (group: string): string => {
  const countryInfo = getCountryInfo(group);
  if (countryInfo) {
    // Return the country code as the canonical key
    return countryInfo.code;
  }
  // Not a country - return the original group name lowercased for consistency
  return group.toLowerCase().trim();
};

// Get display name for a group
export const getDisplayName = (group: string): string => {
  const countryInfo = getCountryInfo(group);
  return countryInfo?.name || group;
};

// Get flag URL for a group
export const getCountryFlagUrl = (group: string): string | null => {
  const countryInfo = getCountryInfo(group);
  return countryInfo?.flagUrl || null;
};

// Get priority for sorting (lower = higher priority)
export const getGroupPriority = (group: string): number => {
  const countryInfo = getCountryInfo(group);
  return countryInfo?.priority || 999; // Non-country groups go last
};

// Category emoji for non-country groups
export const getCategoryEmoji = (group: string): string => {
  const groupLower = group.toLowerCase();
  if (groupLower.includes('netflix')) return '🎬';
  if (groupLower.includes('hbo')) return '🎭';
  if (groupLower.includes('sport')) return '🏆';
  if (groupLower.includes('news')) return '📰';
  if (groupLower.includes('movie') || groupLower.includes('vod')) return '🎥';
  if (groupLower.includes('series')) return '📺';
  if (groupLower.includes('kids') || groupLower.includes('cartoon')) return '🧸';
  if (groupLower.includes('music')) return '🎵';
  if (groupLower.includes('documentary') || groupLower.includes('doc')) return '🎓';
  if (groupLower.includes('adult') || groupLower.includes('xxx')) return '🔞';
  if (groupLower.includes('religious') || groupLower.includes('islam')) return '🕌';
  if (groupLower.includes('cooking') || groupLower.includes('food')) return '🍳';
  if (groupLower.includes('premium')) return '⭐';
  return '📺';
};

// Merge and sort groups, combining duplicate countries
export const mergeAndSortGroups = (
  groupData: Map<string, { count: number; firstLogo?: string; originalNames: string[] }>
): { name: string; displayName: string; count: number; firstLogo?: string; originalNames: string[] }[] => {
  // Merge groups by normalized name
  const mergedGroups = new Map<string, { 
    displayName: string; 
    count: number; 
    firstLogo?: string; 
    originalNames: string[];
    priority: number;
  }>();

  for (const [originalName, data] of groupData.entries()) {
    const normalizedKey = normalizeGroupName(originalName);
    const countryInfo = getCountryInfo(originalName);
    
    const existing = mergedGroups.get(normalizedKey);
    if (existing) {
      // Merge with existing
      existing.count += data.count;
      existing.originalNames.push(originalName);
      if (!existing.firstLogo && data.firstLogo) {
        existing.firstLogo = data.firstLogo;
      }
    } else {
      // Create new entry
      mergedGroups.set(normalizedKey, {
        displayName: countryInfo?.name || originalName,
        count: data.count,
        firstLogo: data.firstLogo,
        originalNames: [originalName],
        priority: countryInfo?.priority || 999,
      });
    }
  }

  // Convert to array and sort
  return Array.from(mergedGroups.entries())
    .map(([name, data]) => ({
      name,
      displayName: data.displayName,
      count: data.count,
      firstLogo: data.firstLogo,
      originalNames: data.originalNames,
    }))
    .sort((a, b) => {
      const priorityA = getGroupPriority(a.originalNames[0]);
      const priorityB = getGroupPriority(b.originalNames[0]);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.displayName.localeCompare(b.displayName);
    });
};

// Sort groups with Arabic first, then USA, then alphabetically
export const sortGroupsByPriority = (groups: { name: string; count: number }[]): { name: string; count: number }[] => {
  return [...groups].sort((a, b) => {
    const priorityA = getGroupPriority(a.name);
    const priorityB = getGroupPriority(b.name);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Same priority - sort alphabetically
    return a.name.localeCompare(b.name);
  });
};
