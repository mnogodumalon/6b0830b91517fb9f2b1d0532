/**
 * src/pages/views/QrMitgliedWerdenView.tsx — QR-Code der Seite „Mitglied werden“.
 *
 * ROUTE   #/ansicht/qr-mitglied-werden — outside the dashboard chrome (reception / beamer).
 * LIVE    static — no data, one link for everybody.
 * PURPOSE Den QR-Code der allgemeinen Seite Mitglied werden bildschirmfüllend zeigen.
 *
 * CONTRACT
 *   - Zeigt den QR-Code so groß wie möglich, mit der Überschrift „Mitglied werden“.
 *   - Der QR-Code ist für alle Besucher gleich.
 */
import { tx } from '@/i18n';
import { MitgliedWerdenQr } from '@/components/widgets/JoinQr';

export default function QrMitgliedWerdenView() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-8 text-center text-foreground">
      <h1 className="font-semibold" style={{ fontSize: 'clamp(2.5rem, 6vh, 6rem)' }}>{tx('Mitglied werden')}</h1>
      <MitgliedWerdenQr size="52vh" />
    </main>
  );
}
