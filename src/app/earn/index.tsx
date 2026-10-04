import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Screen, ScreenHeader, Text, Card, Button, Pill, KeyValueRow } from '@/components';
import { useTheme } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { EARN_POSITION, EARN_RESULT } from '@/features/protocolData';

/**
 * Earn — feature 2. The same three setup steps and the same hook shape as
 * Swap, with only the package and two strings different; here that symmetry is
 * the lesson, so the screen deliberately mirrors swap/index.tsx.
 *
 * Two transactions, not one: the ERC-20 allowance is its own approval before
 * supply() can move anything. The step row makes that explicit rather than
 * hiding it behind a single button.
 *
 * Figures are the captured mainnet position (see @/features/protocolData).
 */
export default function EarnScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { moderateScale } = useResponsive();
  // The screen walks the real run rather than only showing its end state, so the lesson can film
  // supply actually happening: enter -> approve -> supply -> confirmed. `step` still drives the
  // two-transaction row; `phase` is where in that run we are.
  const [phase, setPhase] = useState<'enter' | 'approving' | 'supplying' | 'done'>('done');
  const step: 0 | 1 | 2 = phase === 'enter' ? 0 : phase === 'approving' ? 0 : phase === 'supplying' ? 1 : 2;
  const busy = phase === 'approving' || phase === 'supplying';

  const short = `${EARN_POSITION.txHash.slice(0, 10)}…${EARN_POSITION.txHash.slice(-4)}`;

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Earn" onBack={() => router.back()} />

      <Card style={{ marginBottom: 14, alignItems: 'center', paddingVertical: 18 }}>
        <Text variant="small" color="textSecondary">
          {phase === 'enter' ? `Supply to ${EARN_POSITION.protocol}` : `Supplied to ${EARN_POSITION.protocol}`}
        </Text>
        {/* balance variant wraps "1.000000 USD₮0" onto two lines at phone width */}
        <Text variant="h1" style={{ marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>
          {EARN_POSITION.supplied.amount} {EARN_POSITION.supplied.symbol}
        </Text>
        <View style={{ marginTop: 8 }}>
          <Pill label={`${EARN_POSITION.supplyAprPct}% APR`} active />
        </View>
      </Card>

      {/* Approve, then supply — two transactions, said plainly */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {(['Approve the Pool', 'supply()'] as const).map((label, i) => {
          const done = step > i;
          return (
            <View
              key={label}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                padding: 10,
                borderRadius: theme.radii.md,
                backgroundColor: done ? theme.colors.successTint : theme.colors.bgSecondary,
                borderWidth: 1,
                borderColor: done ? 'transparent' : theme.colors.border,
              }}
            >
              {done ? <Check size={moderateScale(14)} color={theme.colors.success} /> : null}
              <Text variant="small" color={done ? 'textPrimary' : 'textSecondary'} style={{ flexShrink: 1 }}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {busy ? (
        <Card style={{ marginBottom: 14 }}>
          <Text variant="small" color="textSecondary">
            {phase === 'approving'
              ? 'Approving 1 USD\u20ae0 to the Aave v3 Pool…'
              : 'Calling supply() — waiting for the transaction to be included…'}
          </Text>
        </Card>
      ) : null}

      {phase === 'done' ? (
        <Card style={{ marginBottom: 14 }}>
          <KeyValueRow label="Receipt token" value={`${EARN_RESULT.aTokenBalance} aUSD\u20ae0`} accent mono />
          <KeyValueRow label="USD₮0" value={`${EARN_RESULT.before.usdt0} \u2192 ${EARN_RESULT.after.usdt0}`} mono />
          <KeyValueRow label="Fee paid" value={`${EARN_RESULT.feeEthPaid} ETH`} mono />
          <KeyValueRow label="Approve" value={`${EARN_RESULT.approveHash.slice(0, 10)}\u2026`} mono isLast />
        </Card>
      ) : null}

      <Card style={{ marginBottom: 14 }}>
        <KeyValueRow label="Collateral" value={`$${EARN_POSITION.totalCollateralUsd}`} mono />
        <KeyValueRow label="Debt" value={`$${EARN_POSITION.totalDebtUsd}`} mono />
        <KeyValueRow
          label="Health factor"
          value={EARN_POSITION.healthFactorIsMax ? 'uint256 max (no debt)' : '—'}
          accent
        />
        <KeyValueRow
          label="LTV / threshold"
          value={`${EARN_POSITION.ltvPct}% / ${EARN_POSITION.liquidationThresholdPct}%`}
          mono
        />
        <KeyValueRow label="Transaction" value={short} mono isLast />
      </Card>

      <View style={{ marginTop: 'auto', gap: 10 }}>
        <Button
          label={phase === 'enter' ? 'Supply 1 USD\u20ae0' : busy ? 'Working\u2026' : 'View on Arbiscan'}
          onPress={() => {
            if (phase !== 'enter') return;
            // Two transactions, timed the way they actually ran, so the film shows the allowance
            // as its own step instead of a single magic button.
            setPhase('approving');
            setTimeout(() => setPhase('supplying'), 1300);
            setTimeout(() => setPhase('done'), 2800);
          }}
        />
        <Button label="Withdraw" variant="secondary" onPress={() => setPhase('enter')} />
      </View>
    </Screen>
  );
}
