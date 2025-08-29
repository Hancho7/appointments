// LoadingScreen.jsx
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function LoadingScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.headerSkeleton, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.textSkeletonContainer}>
            <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '60%' }]} />
            <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '40%' }]} />
          </View>
        </View>
      </View>

      {/* Stats Grid Skeleton */}
      <View style={styles.statsGrid}>
        {[1, 2].map((item) => (
          <View key={item} style={[styles.statCardSkeleton, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statContent}>
              <View style={[styles.iconSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
              <View style={styles.statTextSkeleton}>
                <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, height: 32 }]} />
                <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '70%' }]} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Content Cards Skeleton */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.contentCardSkeleton, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '40%' }]} />
          </View>
          {[1, 2, 3].map((subItem) => (
            <View key={subItem} style={styles.listItemSkeleton}>
              <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
              <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '80%' }]} />
              <View style={[styles.textSkeleton, { backgroundColor: theme.colors.surfaceVariant, width: '60%' }]} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSkeleton: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  textSkeletonContainer: {
    flex: 1,
  },
  textSkeleton: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCardSkeleton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  statTextSkeleton: {
    flex: 1,
  },
  contentCardSkeleton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 16,
  },
  listItemSkeleton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
});