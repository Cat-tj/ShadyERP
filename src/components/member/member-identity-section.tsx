"use client";

import { useState } from "react";
import { EditMemberForm } from "@/components/member/edit-member-form";

export function MemberIdentitySection({
  memberId,
  name,
  phone,
  email,
  joinedLabel,
  cardSerial,
  canManage,
}: {
  memberId: string;
  name: string;
  phone: string;
  email: string | null;
  joinedLabel: string;
  cardSerial: string | null;
  canManage: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditMemberForm
        memberId={memberId}
        initialName={name}
        initialPhone={phone}
        initialEmail={email}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">{name}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {phone}
          {email ? ` · ${email}` : ""} · Member sejak {joinedLabel}
        </p>
        {cardSerial && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Kartu: {cardSerial}</p>
        )}
      </div>
      {canManage && (
        <button
          onClick={() => setIsEditing(true)}
          className="min-h-[36px] shrink-0 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Ubah
        </button>
      )}
    </div>
  );
}
