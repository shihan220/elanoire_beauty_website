'use client';

import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AdminNewsletterPayload, NewsletterStatusLabel, NewsletterUpdate } from '@/types/admin';
import { formatDateLabel } from './admin-helpers';

type NewsletterMutationResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type NewsletterDraft = {
  email: string;
  source: string;
  status: NewsletterStatusLabel;
};

const emptyNewsletterDraft: NewsletterDraft = {
  email: '',
  source: 'Admin dashboard',
  status: 'Active',
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function draftFromUpdate(update: NewsletterUpdate): NewsletterDraft {
  return {
    email: update.email,
    source: update.source,
    status: update.status,
  };
}

function parseNewsletterPayload(draft: NewsletterDraft): NewsletterMutationResult & { payload?: AdminNewsletterPayload } {
  const fieldErrors: Record<string, string> = {};

  if (!isEmail(draft.email)) fieldErrors.email = 'Enter a valid subscriber email.';
  if (draft.source.trim().length < 2) fieldErrors.source = 'Enter a source.';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    payload: {
      email: draft.email.trim().toLowerCase(),
      source: draft.source.trim(),
      status: draft.status,
    },
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-xs text-[var(--elanoire-color-destructive)]">{message}</p>;
}

export function NewsletterUpdates({
  updates,
  creating,
  busyNewsletterId,
  onCreate,
  onUpdate,
  onDelete,
}: {
  updates: NewsletterUpdate[];
  creating: boolean;
  busyNewsletterId: string | null;
  onCreate: (payload: AdminNewsletterPayload) => Promise<NewsletterMutationResult>;
  onUpdate: (newsletterId: string, payload: AdminNewsletterPayload) => Promise<NewsletterMutationResult>;
  onDelete: (newsletterId: string) => Promise<NewsletterMutationResult>;
}) {
  const [createDraft, setCreateDraft] = useState<NewsletterDraft>(emptyNewsletterDraft);
  const [drafts, setDrafts] = useState<Record<string, NewsletterDraft>>({});
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, Record<string, string>>>({});
  const [message, setMessage] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(updates.map((update) => [update.id, draftFromUpdate(update)])));
  }, [updates]);

  const sortedUpdates = useMemo(
    () => [...updates].sort((left, right) => Date.parse(right.subscribedAt) - Date.parse(left.subscribedAt)),
    [updates],
  );

  async function handleCreate() {
    const parsed = parseNewsletterPayload(createDraft);

    if (!parsed.payload) {
      setCreateErrors(parsed.fieldErrors ?? {});
      return;
    }

    const result = await onCreate(parsed.payload);

    if (result.error || result.fieldErrors) {
      setCreateErrors(result.fieldErrors ?? {});
      setMessage(result.error ?? 'Newsletter entry could not be saved.');
      return;
    }

    setCreateDraft(emptyNewsletterDraft);
    setCreateErrors({});
    setMessage('Newsletter entry saved.');
  }

  async function handleSave(updateId: string) {
    const draft = drafts[updateId];
    if (!draft) return;

    const parsed = parseNewsletterPayload(draft);

    if (!parsed.payload) {
      setRowErrors((current) => ({
        ...current,
        [updateId]: parsed.fieldErrors ?? {},
      }));
      return;
    }

    const result = await onUpdate(updateId, parsed.payload);

    if (result.error || result.fieldErrors) {
      setRowErrors((current) => ({
        ...current,
        [updateId]: result.fieldErrors ?? (result.error ? { general: result.error } : {}),
      }));
      setMessage(result.error ?? 'Newsletter entry could not be updated.');
      return;
    }

    setRowErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[updateId];
      return nextErrors;
    });
    setMessage('Newsletter entry updated.');
  }

  async function handleDelete(updateId: string) {
    const result = await onDelete(updateId);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setConfirmingDeleteId(null);
    setMessage('Newsletter entry removed.');
  }

  return (
    <section className="border border-stone-200 bg-white/80 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-3">
            Newsletter Updates
          </span>
          <h3 className="text-2xl font-serif text-stone-900">Audience records and newsletter status</h3>
        </div>
        <p className="text-sm text-stone-500">
          Add, update, pause, or remove newsletter contacts.
        </p>
      </div>

      {message ? (
        <div className="mb-8 border border-stone-200 bg-[#faf9f6] px-5 py-4">
          <p className="text-sm text-stone-600">{message}</p>
        </div>
      ) : null}

      <div className="border border-stone-200 bg-[#faf9f6] p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Plus size={18} strokeWidth={1.5} className="text-stone-900" />
          <h4 className="text-xl font-serif text-stone-900">Add newsletter contact</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr_12rem] gap-5">
          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Subscriber Email
            </label>
            <input
              type="email"
              value={createDraft.email}
              onChange={(event) => setCreateDraft((current) => ({ ...current, email: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.email} />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Source
            </label>
            <input
              type="text"
              value={createDraft.source}
              onChange={(event) => setCreateDraft((current) => ({ ...current, source: event.target.value }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            />
            <FieldError message={createErrors.source} />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
              Status
            </label>
            <select
              value={createDraft.status}
              onChange={(event) => setCreateDraft((current) => ({ ...current, status: event.target.value as NewsletterStatusLabel }))}
              className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="mt-6 inline-flex items-center gap-3 bg-stone-900 text-[#faf9f6] px-7 py-4 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          {creating ? 'Saving Contact' : 'Add Contact'}
        </button>
      </div>

      <div className="space-y-5">
        {sortedUpdates.length === 0 ? (
          <div className="border border-stone-200 bg-[#faf9f6] p-6">
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              Newsletter contacts will appear here once subscribers are added.
            </p>
          </div>
        ) : (
          sortedUpdates.map((entry) => {
            const draft = drafts[entry.id] ?? draftFromUpdate(entry);
            const isBusy = busyNewsletterId === entry.id;
            const isConfirmingDelete = confirmingDeleteId === entry.id;

            return (
              <article key={entry.id} className="border border-stone-200 bg-[#faf9f6] p-5 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.75fr_10rem_auto] gap-5 items-start">
                  <div>
                    <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [entry.id]: { ...draft, email: event.target.value },
                      }))}
                      className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
                    />
                    <FieldError message={rowErrors[entry.id]?.email} />
                    <p className="mt-2 text-xs text-stone-500">Joined {formatDateLabel(entry.subscribedAt)}</p>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
                      Source
                    </label>
                    <input
                      type="text"
                      value={draft.source}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [entry.id]: { ...draft, source: event.target.value },
                      }))}
                      className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
                    />
                    <FieldError message={rowErrors[entry.id]?.source} />
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.22em] uppercase text-stone-500 mb-3">
                      Status
                    </label>
                    <select
                      value={draft.status}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [entry.id]: { ...draft, status: event.target.value as NewsletterStatusLabel },
                      }))}
                      className="w-full border border-stone-300 bg-transparent px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-900 transition-colors"
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap lg:flex-col gap-4 lg:items-end pt-0 lg:pt-8">
                    <button
                      type="button"
                      onClick={() => handleSave(entry.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save size={14} strokeWidth={1.5} />
                      {isBusy ? 'Saving' : 'Save'}
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex flex-wrap lg:flex-col gap-3 lg:items-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          disabled={isBusy}
                          className="text-xs tracking-[0.22em] uppercase text-[var(--elanoire-color-destructive)] border-b border-[var(--elanoire-color-destructive)] pb-1 disabled:opacity-60"
                        >
                          Confirm Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          disabled={isBusy}
                          className="text-xs tracking-[0.22em] uppercase text-stone-500 border-b border-stone-300 pb-1 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(entry.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-stone-500 border-b border-stone-300 pb-1 hover:text-[var(--elanoire-color-destructive)] hover:border-[var(--elanoire-color-destructive)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {rowErrors[entry.id]?.general ? (
                  <p className="mt-4 text-sm text-[var(--elanoire-color-destructive)]">
                    {rowErrors[entry.id]?.general}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
