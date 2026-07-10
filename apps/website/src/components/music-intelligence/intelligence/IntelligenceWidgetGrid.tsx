import type { IntelligenceWidgetMetric } from '@/lib/music-intelligence/intelligence-types';
import IntelligenceWidgetCard from './IntelligenceWidgetCard';

export default function IntelligenceWidgetGrid({ widgets }: { widgets: IntelligenceWidgetMetric[] }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Intelligence dashboard metrics"
    >
      {widgets.map((widget) => (
        <div key={widget.id} role="listitem">
          <IntelligenceWidgetCard widget={widget} />
        </div>
      ))}
    </div>
  );
}
