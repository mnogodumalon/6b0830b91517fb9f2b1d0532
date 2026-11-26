/**
 * widgets/JoinQr.tsx — the plan's public pages as BOUND QR codes and links.
 *
 * @since 2026-11-26 (a QR view asked for its page by an entity the page has no link to and
 *        read „noch nicht veröffentlicht“ over a published page)
 *
 * GENERATED FROM THE PLAN — one component and one hook per public page, already tied to
 * its page. Place it; never name an entity or a slug, never call PublicPageQr or
 * usePublicPageLink yourself for a page listed here:
 *   <VeranstaltungAnmeldenQr recordId={<id of the veranstaltungen record>} size="34vh" />   → #/public/veranstaltung-anmelden?…=<that record>
 *   <MitgliedWerdenQr size="34vh" />   → #/public/mitglied-werden (one link for everybody)
 * Every component takes the QR's own props (size, showLink, linkClassName …).
 */
import { PublicPageQr, usePublicPageLink, type PublicPageQrProps } from '@/components/widgets/PublicPageQr';

type QrProps = Omit<PublicPageQrProps, 'entity' | 'recordId' | 'page'>;
type ForRecord = QrProps & { recordId: string | null | undefined };

/** „veranstaltung-anmelden“ for ONE veranstaltungen record — Gäste öffnen den Link oder QR-Code einer Veranstaltung und melden sich ohne Anmeldung für genau diese Veranstaltung an: Vorname, Nachname und Anzahl der Persone */
export function VeranstaltungAnmeldenQr({ recordId, ...qr }: ForRecord) {
  return <PublicPageQr entity="veranstaltungen" recordId={recordId} page="veranstaltung-anmelden" {...qr} />;
}
export function useVeranstaltungAnmeldenLink(recordId: string | null | undefined) {
  return usePublicPageLink('veranstaltungen', recordId, 'veranstaltung-anmelden');
}

/** „mitglied-werden“ — one link for everybody — Interessierte tragen ohne Anmeldung Vorname, Nachname, E-Mail-Adresse und gewünschte Sportart ein. Die Seite ist für alle gleich. */
export function MitgliedWerdenQr(qr: QrProps) {
  return <PublicPageQr entity="" recordId={null} page="mitglied-werden" {...qr} />;
}
export function useMitgliedWerdenLink() {
  return usePublicPageLink('', null, 'mitglied-werden');
}
