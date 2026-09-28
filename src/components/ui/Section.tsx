import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { AppText } from './AppText';

interface SectionProps {
  title?: string;
  children: ReactNode;
  /** Wrap children in a bordered surface. */
  boxed?: boolean;
  right?: ReactNode;
}

export function Section({ title, children, boxed, right }: SectionProps) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.header}>
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
          {right}
        </View>
      ) : null}
      {boxed ? (
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export function Divider() {
  const colors = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1 },
  box: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
