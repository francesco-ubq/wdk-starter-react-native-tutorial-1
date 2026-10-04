import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowDown, ShieldCheck } from 'lucide-react-native';
import { Screen, ScreenHeader, Text, Card, Button, KeyValueRow } from '@/components';
import { useTheme } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { SWAP_QUOTE, SWAP_RESULT } from '@/features/protocolData';

/**
 * Swap — feature 1. Quote first, then swap, with a caller-set fee cap.
 *
 * The whole screen is one `useProtocol({ protocolType: 'swap', protocolName:
 * 'velora' })` hook away from being live; on web the worklet is stubbed, so it
 * renders the captured mainnet quote (see @/features/protocolData).
 *
 * The cap is the point worth showing: swapMaxFee is set by the caller, and a
 * quoted fee at or above it makes swap() throw rather than execute. Pressing
 * "Swap with a 1 wei cap" demonstrates exactly that, with the real error text.
 */
export default function SwapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { moderateScale } = useResponsive();
  const [rejection, setRejection] = useState<string | null>(null);
  // quote -> submitting -> done, the three states the real call actually passes through. The
  // figures on the done card are the receipt of the swap this wallet really sent (SWAP_RESULT).
  const [phase, setPhase] = useState<'quote' | 'submitting' | 'done'>('quote');

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Swap" onBack={() => router.back()} />

      {/* You pay / you get, the way every swap UI states it */}
      <Card style={{ marginBottom: 12 }}>
        <Text variant="small" color="textSecondary">You pay</Text>
        <Text variant="h2" style={{ marginTop: 2 }}>
          {SWAP_QUOTE.tokenIn.amount} {SWAP_QUOTE.tokenIn.symbol}
        </Text>
      </Card>

      <View style={{ alignItems: 'center', marginTop: -6, marginBottom: -6, zIndex: 1 }}>
        <View
          style={{
            width: moderateScale(32),
            height: moderateScale(32),
            borderRadius: moderateScale(16),
            backgroundColor: theme.colors.bgPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowDown size={moderateScale(16)} color={theme.colors.textSecondary} />
        </View>
      </View>

      <Card style={{ marginBottom: 14 }}>
        <Text variant="small" color="textSecondary">You get</Text>
        <Text variant="h2" color="brand" style={{ marginTop: 2 }}>
          {SWAP_QUOTE.tokenOut.amount} {SWAP_QUOTE.tokenOut.symbol}
        </Text>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <KeyValueRow label="Route" value="Velora" />
        <KeyValueRow label="Network" value={SWAP_QUOTE.chain} />
        <KeyValueRow label="Network fee" value={`${SWAP_QUOTE.feeEth} ETH`} mono />
        <KeyValueRow label="Fee cap (swapMaxFee)" value="0.002 ETH" mono accent isLast />
      </Card>

      {/* The cap, demonstrated rather than described */}
      {rejection ? (
        <Card style={{ marginBottom: 14, borderColor: theme.colors.error, borderWidth: 1 }}>
          <Text variant="small" color="error">swap() rejected</Text>
          <Text variant="body" mono style={{ marginTop: 4 }}>{rejection}</Text>
        </Card>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheck size={moderateScale(15)} color={theme.colors.success} />
          <Text variant="small" color="textSecondary" style={{ flex: 1 }}>
            The fee cannot drift above the cap you set — swap() throws instead.
          </Text>
        </View>
      )}

      {phase === 'submitting' && (
        <Card style={{ marginBottom: 14 }}>
          <Text variant="small" color="textSecondary">Submitting</Text>
          <Text variant="body" style={{ marginTop: 4 }}>
            Waiting for the transaction to be included…
          </Text>
        </Card>
      )}

      {phase === 'done' && (
        <Card style={{ marginBottom: 14, borderColor: theme.colors.success, borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldCheck size={moderateScale(15)} color={theme.colors.success} />
            <Text variant="small" color="success">Confirmed</Text>
          </View>
          <KeyValueRow label="Received" value={`${SWAP_QUOTE.tokenOut.amount} ${SWAP_QUOTE.tokenOut.symbol}`} mono accent />
          <KeyValueRow label="USD₮0" value={`${SWAP_RESULT.before.usdt0} → ${SWAP_RESULT.after.usdt0}`} mono />
          <KeyValueRow label="WBTC" value={`${SWAP_RESULT.before.wbtc} → ${SWAP_RESULT.after.wbtc}`} mono />
          <KeyValueRow label="Fee paid" value={`${SWAP_RESULT.feeEthPaid} ETH`} mono />
          <KeyValueRow label="Block" value={SWAP_RESULT.block} mono />
          <KeyValueRow label="Tx" value={`${SWAP_RESULT.hash.slice(0, 10)}…${SWAP_RESULT.hash.slice(-8)}`} mono isLast />
        </Card>
      )}

      <View style={{ marginTop: 'auto', gap: 10 }}>
        <Button
          label={phase === 'done' ? 'View on Arbiscan' : `Swap ${SWAP_QUOTE.tokenIn.symbol}`}
          onPress={() => {
            setRejection(null);
            if (phase === 'quote') { setPhase('submitting'); setTimeout(() => setPhase('done'), 1400); }
          }}
        />
        <Button
          label="Set cap to 1 wei"
          variant="secondary"
          onPress={() => setRejection(SWAP_QUOTE.capRejection)}
        />
      </View>
    </Screen>
  );
}
