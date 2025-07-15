import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

// Responsive container styles
export const ResponsiveStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.container.horizontal,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.container.horizontal,
    paddingVertical: Spacing.container.vertical,
  },
  
  // Grid layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Responsive grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  
  gridItem: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  
  // Responsive widths
  fullWidth: {
    width: '100%',
  },
  
  halfWidth: {
    width: '50%',
  },
  
  thirdWidth: {
    width: '33.333%',
  },
  
  quarterWidth: {
    width: '25%',
  },
  
  // Card layouts
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.card.padding,
    marginHorizontal: Spacing.card.margin,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  cardContent: {
    marginBottom: Spacing.md,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Form layouts
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  
  inputGroup: {
    marginBottom: Spacing.md,
  },
  
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  // Header styles
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderBottomLeftRadius: Spacing.radius.xl,
    borderBottomRightRadius: Spacing.radius.xl,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  headerText: {
    flex: 1,
  },
  
  // Search and filter styles
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  searchInput: {
    flex: 2,
  },
  
  filterInput: {
    flex: 1,
  },
  
  // List styles
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Stats and metrics
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    margin: Spacing.lg,
    maxHeight: '80%',
    width: '90%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  modalBody: {
    padding: Spacing.lg,
  },
  
  modalFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});

// Responsive helper function
export function getResponsiveStyle(
  baseStyle: ViewStyle | TextStyle,
  tabletStyle?: ViewStyle | TextStyle,
  desktopStyle?: ViewStyle | TextStyle
) {
  // This would be used with the useResponsive hook
  return baseStyle; // Base implementation
}