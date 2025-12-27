export const colors = {
  light: {
    primary: '#DC2626',
    secondary: '#F59E0B',
    success: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
  },
  dark: {
    primary: '#EF4444',
    secondary: '#FBBF24',
    success: '#34D399',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#F87171',
  },
};

export function getTheme(darkMode: boolean) {
  return darkMode ? colors.dark : colors.light;
}