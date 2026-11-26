import type { MitgliedWerden } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface MitgliedWerdenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: MitgliedWerden;
}

export function MitgliedWerdenDetails({
  record,
}: MitgliedWerdenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('mitglied_werden', 'interessent_vorname')} value={record.fields.interessent_vorname} format="text" />
        <RecordField label={fieldLabel('mitglied_werden', 'interessent_nachname')} value={record.fields.interessent_nachname} format="text" />
        <RecordField label={fieldLabel('mitglied_werden', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('mitglied_werden', 'sportart')} value={record.fields.sportart} format="pill" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.MITGLIED_WERDEN} recordId={record.record_id} readOnly={!perms.canWrite('mitglied_werden')} />
    </>
  );
}
