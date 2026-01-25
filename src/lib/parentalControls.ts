 const PARENTAL_CONTROLS_KEY = 'mi_parental_controls';
 const USAGE_TIME_KEY = 'mi_usage_time';
 
 export interface ParentalControlSettings {
   enabled: boolean;
   password: string;
   hiddenContent: {
     movies: boolean;
     series: boolean;
     live: boolean;
     sports: boolean;
   };
   timeLimit: {
     enabled: boolean;
     dailyLimitMinutes: number;
   };
 }
 
 const DEFAULT_SETTINGS: ParentalControlSettings = {
   enabled: false,
   password: '',
   hiddenContent: {
     movies: false,
     series: false,
     live: false,
     sports: false,
   },
   timeLimit: {
     enabled: false,
     dailyLimitMinutes: 120,
   },
 };
 
 export const getParentalControls = (): ParentalControlSettings => {
   try {
     const stored = localStorage.getItem(PARENTAL_CONTROLS_KEY);
     if (!stored) return DEFAULT_SETTINGS;
     return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
   } catch {
     return DEFAULT_SETTINGS;
   }
 };
 
 export const saveParentalControls = (settings: ParentalControlSettings): void => {
   try {
     localStorage.setItem(PARENTAL_CONTROLS_KEY, JSON.stringify(settings));
   } catch (e) {
     console.error('Failed to save parental controls:', e);
   }
 };
 
 export const verifyPassword = (password: string): boolean => {
   const settings = getParentalControls();
   return settings.password === password;
 };