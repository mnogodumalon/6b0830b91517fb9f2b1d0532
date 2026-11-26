import { useMemo, useState } from 'react';
import { format, isValid, subDays } from 'date-fns';
import { IconCalendarEvent, IconMapPin, IconPlus, IconQrcode, IconUsers, IconUserPlus } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { extractRecordId } from '@/services/livingAppsService';
import { useClock, gruss, namen } from '@/lib/polish';
import { dateFnsLocale, tx, appLabel } from '@/i18n';
import { countOf, viewHref } from '@/config/plan';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { Button } from '@/components/ui/button';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';
import type { MitgliedWerden } from '@/types/app';

// Widget decision: CalendarWidget rejected — the owner needs per-event sums of registrations and a
// QR button per row, which no calendar slot covers; the list below IS the primary workspace.
export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { veranstaltungen, mitgliedWerden } = data;
  const crud = useEntityCrud(data);
  const enrichedAnmeldungen = crud.enriched.anmeldungen;
  const clock = useClock();
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);

  const nowKey = format(clock, "yyyy-MM-dd'T'HH:mm");

  const rows = useMemo(() => {
    const byEvent = new Map<string, { count: number; persons: number; names: string[] }>();
    for (const a of enrichedAnmeldungen) {
      const id = extractRecordId(a.fields.veranstaltung);
      if (!id) continue;
      const e = byEvent.get(id) ?? { count: 0, persons: 0, names: [] };
      e.count += 1;
      e.persons += a.fields.anzahl_personen ?? 1;
      if (a.fields.gast_vorname) e.names.push(`${a.fields.gast_vorname} ${a.fields.gast_nachname ?? ''}`.trim());
      byEvent.set(id, e);
    }
    const list = veranstaltungen.map(v => ({
      v,
      upcoming: (v.fields.datum ?? '') >= nowKey,
      stats: byEvent.get(v.record_id) ?? { count: 0, persons: 0, names: [] as string[] },
    }));
    const up = list.filter(r => r.upcoming).sort((a, b) => (a.v.fields.datum ?? '').localeCompare(b.v.fields.datum ?? ''));
    const past = list.filter(r => !r.upcoming).sort((a, b) => (b.v.fields.datum ?? '').localeCompare(a.v.fields.datum ?? ''));
    return { up, past };
  }, [veranstaltungen, enrichedAnmeldungen, nowKey]);

  const personsUpcoming = rows.up.reduce((s, r) => s + r.stats.persons, 0);
  const weekAgo = format(subDays(clock, 7), "yyyy-MM-dd'T'HH:mm");
  const newestRequests = useMemo(
    () => [...mitgliedWerden].sort((a, b) => (b.createdat ?? '').localeCompare(a.createdat ?? '')),
    [mitgliedWerden],
  );
  const recentCount = newestRequests.filter(m => (m.createdat ?? '') >= weekAgo).length;

  const chartRows: ChartRow<MitgliedWerden>[] = useMemo(
    () => mitgliedWerden.map(m => ({ id: `mitglied_werden:${m.record_id}`, data: m })),
    [mitgliedWerden],
  );

  const shown = onlyUpcoming ? rows.up : [...rows.up, ...rows.past];
  const fmt = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isValid(d) ? format(d, 'EEE, dd.MM.yyyy · HH:mm', { locale: dateFnsLocale() }) : iso;
  };

  const next = rows.up[0];
  const context = next
    ? tx`Als Nächstes: ${next.v.fields.titel ?? ''} am ${fmt(next.v.fields.datum)} — ${namen(next.stats.names.map(n => n.split(' ')[0]))}`
    : newestRequests.length > 0
      ? tx`Zuletzt interessiert: ${namen(newestRequests.slice(0, 3).map(m => m.fields.interessent_vorname ?? ''))}`
      : tx('Lege deine erste Veranstaltung an und teile den QR-Code.');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{gruss(clock)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{context}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={viewHref('qr-mitglied-werden')} target="_blank" rel="noopener">
              <IconQrcode size={16} className="shrink-0" />
              {tx('QR „Mitglied werden“')}
            </a>
          </Button>
          {crud.veranstaltungen.canWrite && (
            <Button onClick={() => crud.veranstaltungen.openCreate({})}>
              <IconPlus size={16} className="shrink-0" />
              {tx('Neue Veranstaltung')}
            </Button>
          )}
        </div>
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Kommende Veranstaltungen')}
              value={rows.up.length}
              icon={<IconCalendarEvent size={16} className="text-muted-foreground" />}
              onClick={() => setOnlyUpcoming(v => !v)}
              active={onlyUpcoming}
            />
            <StatStripItem
              title={tx('Angemeldete Personen (kommend)')}
              value={personsUpcoming}
              icon={<IconUsers size={16} className="text-muted-foreground" />}
            />
            <StatStripItem
              title={tx('Neue Anfragen (7 Tage)')}
              value={recentCount}
              tone={recentCount > 0 ? 'primary' : 'default'}
              icon={<IconUserPlus size={16} className="text-muted-foreground" />}
            />
          </StatStrip>
        }
        primary={
          <section className="overflow-hidden rounded-[27px] bg-card px-4 py-5 shadow-lg sm:px-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {appLabel('veranstaltungen')}
            </h2>
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <IconCalendarEvent size={48} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{tx('Noch keine Veranstaltung — lege die erste an.')}</p>
                {crud.veranstaltungen.canWrite && (
                  <Button onClick={() => crud.veranstaltungen.openCreate({})}>{tx('Erste Veranstaltung anlegen')}</Button>
                )}
              </div>
            ) : (
              <ul className="divide-y">
                {shown.map(({ v, upcoming, stats }) => (
                  <li key={v.record_id} className={`flex flex-wrap items-center gap-3 py-3 ${upcoming ? '' : 'opacity-70'}`}>
                    <button
                      type="button"
                      onClick={() => crud.veranstaltungen.openDetail(v)}
                      className="min-w-0 flex-1 basis-60 text-left"
                    >
                      <span className="block truncate font-medium">{v.fields.titel}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span>{fmt(v.fields.datum)}</span>
                        {v.fields.ort && (
                          <span className="inline-flex items-center gap-1"><IconMapPin size={12} className="shrink-0" />{v.fields.ort}</span>
                        )}
                      </span>
                      {stats.names.length > 0 && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {namen(stats.names.map(n => n.split(' ')[0]), 4)}
                        </span>
                      )}
                    </button>
                    <div className="flex shrink-0 flex-col items-end text-right">
                      <span className="text-lg font-semibold leading-none">{stats.persons}</span>
                      <span className="text-xs text-muted-foreground">
                        {tx('Personen')} · {countOf('anmeldungen', stats.count, appLabel('anmeldungen'))}
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                      <a href={viewHref('qr-veranstaltung', v.record_id)} target="_blank" rel="noopener">
                        <IconQrcode size={16} className="shrink-0" />
                        {tx('QR-Code')}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        }
        aside={
          <>
            <WorkList
              title={tx('Neue Mitgliedsanfragen')}
              icon={<IconUserPlus size={16} />}
              items={newestRequests.map(m => ({
                id: m.record_id,
                title: `${m.fields.interessent_vorname ?? ''} ${m.fields.interessent_nachname ?? ''}`.trim(),
                secondLine: (
                  <>
                    <span className="font-medium text-foreground">{m.fields.sportart?.label ?? tx('Ohne Sportart')}</span>
                    <span className="text-muted-foreground"> · {m.fields.email}</span>
                  </>
                ),
              }))}
              onItemClick={id => {
                const rec = mitgliedWerden.find(m => m.record_id === id);
                if (rec) crud.mitgliedWerden.openDetail(rec);
              }}
              empty={{ text: tx('Noch keine Anfragen — zeige den QR-Code am Empfang.') }}
            />
            <ChartWidget<MitgliedWerden>
              title={tx('Anfragen nach Sportart')}
              rows={chartRows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.sportart, label: tx('Sportart') }}
              interaction={{
                mode: 'drill',
                onSegmentClick: seg => {
                  const rec = mitgliedWerden.find(m => `mitglied_werden:${m.record_id}` === seg.rowIds[0]);
                  if (rec) crud.mitgliedWerden.openDetail(rec);
                },
              }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
