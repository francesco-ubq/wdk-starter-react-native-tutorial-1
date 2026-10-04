import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

/**
 * A label on the left, a value on the right, with the hairline divider the
 * send/review screen already uses between rows. The three feature screens all
 * show lists of protocol figures, so the pattern is factored out here instead
 * of being rebuilt in each one.
 */
export function KeyValueRow({
  label,
  value,
  accent,
  mono,
  isLast,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
  isLast?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.border,
        gap: 12,
      }}
    >
      <Text variant="small" color="textSecondary">{label}</Text>
      <Text
        variant="body"
        mono={mono}
        color={accent ? 'brand' : 'textPrimary'}
        style={{ flexShrink: 1, textAlign: 'right' }}
      >
        {value}
      </Text>
    </View>
  );
}
