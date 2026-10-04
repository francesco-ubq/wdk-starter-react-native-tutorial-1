import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, PenLine } from 'lucide-react-native';
import { Screen, ScreenHeader, Text, Card, Button, KeyValueRow } from '@/components';
import { useTheme } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { PAY_CHALLENGE, PAY_RESULT } from '@/features/protocolData';

/**
 * Agent pay — feature 3. HTTP 402, reserved since 1997 and finally used.
 *
 * An agent requests a paid resource, the server answers 402 with what it wants,
 * the wallet signs an EIP-3009 TransferWithAuthorization, and the request is
 * retried with an X-PAYMENT header. The wallet only ever SIGNS: the facilitator
 * submits the transfer and pays the gas, which is why this works with no native
 * token in the wallet at all.
 *
 * The 402 challenge shown is the real one captured from the live endpoint (see
 * @/features/protocolData). This wallet HAS now paid one: the screen walks the real run —
 * 402, sign, settle, 200 — and every figure in the settled state is from that transaction.
 * The resource server and the facilitator are ours, which the screen says out loud.
 */
export default function PayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { moderateScale } = useResponsive();
  // The real run: 402 -> signed -> settled (200). `signed` is kept as the old flag so the
  // challenge/sign cards read the same, with `phase` carrying the rest.
  const [phase, setPhase] = useState<'challenge' | 'settling' | 'done'>('done');
  const signed = phase !== 'challenge';

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="Agent pay" onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Bot size={moderateScale(16)} color={theme.colors.brand} />
        <Text variant="small" color="textSecondary" style={{ flex: 1 }}>
          Your agent asked for a paid resource.
        </Text>
      </View>

      {/* The challenge, exactly as the server sent it */}
      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Text variant="small" color="brand" mono>402</Text>
          <Text variant="small" color="textSecondary">Payment Required</Text>
        </View>
        <Text variant="small" mono style={{ marginBottom: 10 }}>
          {PAY_CHALLENGE.method} {PAY_CHALLENGE.resource.replace('https://', '')}
        </Text>
        <KeyValueRow label="Scheme" value={PAY_CHALLENGE.scheme} mono />
        <KeyValueRow label="Network" value={PAY_CHALLENGE.network} mono />
        <KeyValueRow label="Price" value={`$${PAY_CHALLENGE.amount} ${PAY_CHALLENGE.asset}`} accent isLast />
      </Card>

      {/* Said out loud: we host both ends. No live third-party market with a Tether leg verified. */}
      {PAY_CHALLENGE.selfHosted ? (
        <Text variant="small" color="textSecondary" style={{ marginTop: -6, marginBottom: 12 }}>
          Seller and facilitator are self-hosted on {PAY_CHALLENGE.chain}.
        </Text>
      ) : null}

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PenLine size={moderateScale(15)} color={signed ? theme.colors.success : theme.colors.textSecondary} />
          <Text variant="small" color="textSecondary" style={{ flex: 1 }}>
            {signed
              ? 'Signed. The facilitator submits the transfer and pays the gas.'
              : 'You sign a TransferWithAuthorization. You never submit it, and you pay no gas.'}
          </Text>
        </View>
      </Card>

      {phase === 'settling' ? (
        <Card style={{ marginBottom: 14 }}>
          <Text variant="small" color="textSecondary">
            Facilitator verifying and settling…
          </Text>
        </Card>
      ) : null}

      {phase === 'done' ? (
        <Card style={{ marginBottom: 14 }}>
          <KeyValueRow label="Resource" value="200 OK" accent />
          <KeyValueRow label="Paid" value={`${PAY_RESULT.before.usdt0} \u2192 ${PAY_RESULT.after.usdt0}`} mono />
          <KeyValueRow label="Gas you paid" value="0 ETH" accent />
          <KeyValueRow label="Gas the facilitator paid" value={`${PAY_RESULT.feeEthPaidByFacilitator} ETH`} mono />
          <KeyValueRow label="Transaction" value={`${PAY_RESULT.hash.slice(0, 10)}\u2026`} mono isLast />
        </Card>
      ) : null}

      <View style={{ marginTop: 'auto', gap: 10 }}>
        <Button
          label={phase === 'challenge' ? `Approve $${PAY_CHALLENGE.amount}`
               : phase === 'settling' ? 'Retry with X-PAYMENT\u2026' : 'View on Arbiscan'}
          onPress={() => {
            if (phase !== 'challenge') return;
            setPhase('settling');
            setTimeout(() => setPhase('done'), 1500);
          }}
        />
        <Button label="Decline" variant="secondary" onPress={() => setPhase('challenge')} />
      </View>
    </Screen>
  );
}
