import Badge from '../common/Badge';

export default function EventStatusBadge({ status, className = '' }) {
  const normalized = (status || 'DRAFT').toUpperCase();

  switch (normalized) {
    case 'PUBLISHED':
      return (
        <Badge variant="success" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Published
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="neutral" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          Draft
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="blue" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="red" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
}
