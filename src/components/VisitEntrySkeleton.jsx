// VisitEntrySkeleton.jsx
import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

export default function VisitEntrySkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab Selection Skeleton */}
      <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.segmentedButtonsSkeleton}>
            {[1, 2, 3].map((item) => (
              <View 
                key={item} 
                style={[
                  styles.segmentSkeleton, 
                  { backgroundColor: theme.colors.surfaceVariant }
                ]} 
              />
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Form Content Skeleton */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {/* Title Skeleton */}
          <View style={[styles.titleSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={[styles.subtitleSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          {/* Form Fields Skeleton */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.inputContainer}>
              <View style={[styles.inputSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
            </View>
          ))}
          
          {/* Submit Button Skeleton */}
          <View style={[styles.buttonSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  segmentedButtonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
  },
  segmentSkeleton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  card: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
    paddingVertical: 8,
  },
  titleSkeleton: {
    height: 28,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subtitleSkeleton: {
    height: 20,
    borderRadius: 4,
    marginBottom: 24,
    width: '90%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputSkeleton: {
    height: 56,
    borderRadius: 4,
  },
  buttonSkeleton: {
    height: 48,
    borderRadius: 8,
    marginTop: 16,
  },
});