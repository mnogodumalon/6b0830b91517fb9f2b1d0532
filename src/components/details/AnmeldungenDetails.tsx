import type { Anmeldungen, Veranstaltungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf } from '@/lib/journey/rules';

export interface AnmeldungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Anmeldungen;
  /** N:1-Ziel „Veranstaltungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  veranstaltungenList: Veranstaltungen[];
  /** Klick auf die Veranstaltungen-Relation → overlay.push auf dessen Detail. */
  onOpenVeranstaltungen?: (record: Veranstaltungen) => void;
}

export function AnmeldungenDetails({
  record,
  veranstaltungenList,
  onOpenVeranstaltungen,
}: AnmeldungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const veranstaltungTarget = veranstaltungenList.find(r => r.record_id === extractRecordId(record.fields.veranstaltung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('anmeldungen', 'gast_vorname')} value={record.fields.gast_vorname} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'gast_nachname')} value={record.fields.gast_nachname} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'anzahl_personen')} value={record.fields.anzahl_personen} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('anmeldungen', 'veranstaltung')}
          name={veranstaltungTarget ? (displayNameOf('veranstaltungen', veranstaltungTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[veranstaltungTarget?.fields.ort].filter(Boolean).join(' · ') || undefined}
          onClick={veranstaltungTarget && onOpenVeranstaltungen ? () => onOpenVeranstaltungen!(veranstaltungTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ANMELDUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('anmeldungen')} />
    </>
  );
}
