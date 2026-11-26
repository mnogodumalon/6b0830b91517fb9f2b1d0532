/**
 * src/pages/views/QrVeranstaltungView.tsx — QR-Code zur Anmeldung für genau eine Veranstaltung.
 *
 * ROUTE   #/ansicht/qr-veranstaltung?record=<id> — outside the dashboard chrome (beamer / kiosk).
 * LIVE    static — loads once.
 * READS   veranstaltungen (titel, datum, ort) — ONE record, pinned via `?record=`.
 * PURPOSE Den QR-Code der Anmeldung einer Veranstaltung bildschirmfüllend zeigen.
 *
 * CONTRACT
 *   - Zeigt den QR-Code der Anmeldeseite genau dieser Veranstaltung so groß wie möglich, darüber Titel, Datum und Ort.
 *   - Ohne oder mit unbekannter Veranstaltung erscheint „Veranstaltung wählen“ ohne QR-Code.
 */
import { format } from 'date-fns';
import { useLiveRecord } from '@/hooks/useLiveRecords';
import { dateFnsLocale, tx } from '@/i18n';
import { PublicPageQr } from '@/components/widgets/PublicPageQr';

export default function QrVeranstaltungView() {
  const pinned = (new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('record') ?? '').replace(/["\\]/g, '');
  const live = useLiveRecord('veranstaltungen', pinned, { intervalMs: 0 });
  const rec = live.record;
  const big = { fontSize: 'clamp(1.5rem, 2.8vh, 3rem)' };

  if (live.error && !rec) {
    return (
      <main className="min-h-dvh bg-background p-10 text-foreground">
        <p role="alert" data-live-error className="text-destructive" style={big}>
          {live.unauthorized ? tx('Bitte melde dich an, um diese Ansicht zu sehen.') : tx('Die Daten konnten nicht geladen werden.')}
        </p>
      </main>
    );
  }

  if (!pinned || (!live.loading && !rec)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-10 text-foreground">
        <p data-view-no-record className="font-semibold" style={{ fontSize: 'clamp(2rem, 4.5vh, 4.5rem)' }}>{tx('Veranstaltung wählen')}</p>
      </main>
    );
  }

  if (!rec) return <main className="min-h-dvh bg-background" />;

  const when = rec.fields.datum ? format(new Date(rec.fields.datum), 'EEEE, dd. MMMM yyyy · HH:mm', { locale: dateFnsLocale() }) : '';

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-8 text-center text-foreground">
      <div>
        <h1 className="font-semibold" style={{ fontSize: 'clamp(2rem, 5vh, 5rem)' }}>{rec.fields.titel}</h1>
        <p className="mt-2 text-muted-foreground" style={big}>{[when, rec.fields.ort].filter(Boolean).join(' · ')}</p>
      </div>
      <PublicPageQr entity="veranstaltungen" recordId={rec.record_id} page="veranstaltung-anmelden" size="52vh" />
    </main>
  );
}
