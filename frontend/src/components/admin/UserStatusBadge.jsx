import Badge from '../common/Badge';

export default function UserStatusBadge({ status, className = '' }) {
  const normalized = (status || 'ACTIVE').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
      return (
        <Badge variant="success" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </Badge>
      );
    case 'SUSPENDED':
      return (
        <Badge variant="red" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          Suspended
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="amber" className={className}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
}
