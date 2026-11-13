function formatPublishedAt(value) {
  if (!value) return 'Recent';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function adaptAnnouncement(announcement) {
  if (!announcement || typeof announcement !== 'object') return null;

  const priority = String(announcement.priority || 'NORMAL').toUpperCase();
  return {
    ...announcement,
    priority:
      priority === 'URGENT'
        ? 'Urgent'
        : priority === 'HIGH'
          ? 'Important'
          : priority === 'LOW'
            ? 'Low'
            : 'Normal',
    pinned: Boolean(announcement.pinned ?? announcement.isPinned),
    publishedAt: announcement.publishedAt || formatPublishedAt(announcement.createdAt),
    author:
      announcement.author ||
      announcement.creator?.name ||
      'Event organizer',
  };
}

export function adaptAnnouncementsList(announcements) {
  if (!Array.isArray(announcements)) return [];
  return announcements.map(adaptAnnouncement).filter(Boolean);
}
