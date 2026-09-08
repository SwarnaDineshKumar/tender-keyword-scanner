import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function RelevanceBadge({ relevance }) {
  const norm = String(relevance || '').trim().toLowerCase();

  if (norm === 'related') {
    return (
      <span className="badge badge-related">
        <CheckCircle2 size={14} />
        Related
      </span>
    );
  }

  if (norm === 'possibly related' || norm === 'possible') {
    return (
      <span className="badge badge-possible">
        <AlertCircle size={14} />
        Possibly Related
      </span>
    );
  }

  return (
    <span className="badge badge-not">
      <XCircle size={14} />
      Not Related
    </span>
  );
}
