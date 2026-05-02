'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { SignOutButton } from '../auth/SignOutButton';
import type {
  AccountAddress,
  AccountAddressInput,
  AccountDashboardData,
  AccountOrder,
  AccountProfile,
  AccountProfileInput,
} from '@/types/account';

type Errors = Record<string, string>;

const accountSections = [
  {
    title: 'Profile Details',
    icon: User,
    description: 'Personal information for checkout and order communication.',
  },
  {
    title: 'Orders',
    icon: Package,
    description: 'A refined view of recent purchases and order progress.',
  },
  {
    title: 'Saved Addresses',
    icon: MapPin,
    description: 'Delivery destinations for a faster checkout experience.',
  },
  {
    title: 'Settings',
    icon: Settings,
    description: 'Security and communication controls kept simple and honest.',
  },
];

const emptyAddressInput: AccountAddressInput = {
  label: '',
  fullName: '',
  phoneNumber: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'United Kingdom',
  isDefault: false,
};

function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{
    message?: string;
    errors?: Errors;
    profile?: AccountProfile;
    addresses?: AccountAddress[];
  }>;
}

function formatCurrency(value: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(value / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatOrderStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusClassName(status: string) {
  if (status === 'CANCELLED') {
    return 'border-[var(--elanoire-color-destructive)]/20 bg-[var(--elanoire-color-destructive)]/5 text-[var(--elanoire-color-destructive)]';
  }

  return 'border-stone-300 bg-[#faf9f6] text-stone-700';
}

function toProfileInput(profile: AccountProfile): AccountProfileInput {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phoneNumber: profile.phoneNumber ?? '',
  };
}

function toAddressInput(address: AccountAddress): AccountAddressInput {
  return {
    label: address.label,
    fullName: address.fullName ?? '',
    phoneNumber: address.phoneNumber ?? '',
    line1: address.line1,
    line2: address.line2 ?? '',
    city: address.city,
    state: address.state ?? '',
    postcode: address.postcode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-4 block">
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
        {title}
      </h2>
      <p className="text-stone-600 font-light leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-stone-200 bg-[#faf9f6] p-8 md:p-10">
      <h3 className="text-xl font-serif text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-600 font-light leading-relaxed mb-8 max-w-xl">
        {description}
      </p>
      {action}
    </div>
  );
}

function StatusMessage({
  tone,
  message,
}: {
  tone: 'error' | 'success';
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div className={`border px-5 py-4 ${tone === 'error'
      ? 'border-[var(--elanoire-color-destructive)]/20 bg-[var(--elanoire-color-destructive)]/5'
      : 'border-stone-200 bg-white/75'}`}>
      <p className={`text-sm ${tone === 'error' ? 'text-[var(--elanoire-color-destructive)]' : 'text-stone-600'}`}>
        {message}
      </p>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full bg-transparent border-0 border-b border-stone-300 px-0 py-4 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 transition-colors"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-3 text-sm text-stone-600 font-light cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 border border-stone-300 accent-stone-900"
      />
      <span>{label}</span>
    </label>
  );
}

function ProfileSection({
  profile,
  onProfileUpdate,
}: {
  profile: AccountProfile;
  onProfileUpdate: (profile: AccountProfile) => void;
}) {
  const [draft, setDraft] = useState<AccountProfileInput>(toProfileInput(profile));
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('success');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setMessageTone('success');
    setErrors({});

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draft),
      });
      const data = await readJson(response);

      if (!response.ok || !data.profile) {
        setErrors(data.errors ?? {});
        setMessageTone('error');
        setMessage(data.message ?? 'Your profile could not be saved.');
        return;
      }

      onProfileUpdate(data.profile);
      setDraft(toProfileInput(data.profile));
      setMessageTone('success');
      setMessage('Profile details updated.');
    } catch {
      setMessageTone('error');
      setMessage('Your profile could not be saved right now.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="profile" className="border-t border-stone-200 pt-12">
      <SectionHeading
        eyebrow="Profile"
        title="Profile Details"
        description="Update your personal details for checkout, order communication, and account support."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-16 items-start">
        <aside className="border border-stone-200 bg-white/70 p-8">
          <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-4">Customer</span>
          <h3 className="text-3xl font-serif text-stone-900">{profile.fullName}</h3>
          <p className="mt-4 text-stone-600 font-light leading-relaxed">{profile.email}</p>
          <div className="mt-8 space-y-4 text-sm text-stone-600 font-light">
            <div className="flex items-center gap-3">
              <Mail size={16} strokeWidth={1.5} className="text-stone-500" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock3 size={16} strokeWidth={1.5} className="text-stone-500" />
              <span>Member since {formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-8 border-t border-stone-300 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextField
              id="first-name"
              label="First Name"
              value={draft.firstName}
              onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <TextField
              id="last-name"
              label="Last Name"
              value={draft.lastName}
              onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))}
              error={errors.lastName}
              autoComplete="family-name"
            />
            <TextField
              id="email-address"
              label="Email Address"
              value={draft.email}
              onChange={(value) => setDraft((current) => ({ ...current, email: value }))}
              error={errors.email}
              type="email"
              autoComplete="email"
            />
            <TextField
              id="phone-number"
              label="Phone Number"
              value={draft.phoneNumber}
              onChange={(value) => setDraft((current) => ({ ...current, phoneNumber: value }))}
              error={errors.phoneNumber}
              type="tel"
              autoComplete="tel"
            />
          </div>

          <StatusMessage tone={messageTone} message={message} />

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-3 bg-stone-900 text-[#faf9f6] px-8 py-4 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                Saving Profile
              </>
            ) : (
              <>
                <CheckCircle2 size={16} strokeWidth={1.5} />
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function OrdersSection({ orders }: { orders: AccountOrder[] }) {
  return (
    <section id="orders" className="border-t border-stone-200 pt-12">
      <SectionHeading
        eyebrow="Orders"
        title="Orders"
        description="A clear record of your recent purchases, payment status, and order contents."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your first Élanoire purchase will be listed here with status, totals, and item details."
          action={
            <Link href="/" className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors">
              Continue Shopping
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <details key={order.id} className="group border border-stone-200 bg-white/75 open:bg-white/85">
              <summary className="list-none cursor-pointer p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-2xl font-serif text-stone-900">{order.reference}</h3>
                      <span className={`inline-flex items-center border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${getStatusClassName(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 tracking-[0.16em] uppercase mb-4">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-stone-600 font-light leading-relaxed">
                      {order.items.slice(0, 2).map((item) => item.name).join(' · ')}
                      {order.items.length > 2 ? ` · +${order.items.length - 2} more` : ''}
                    </p>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-4">
                    <p className="text-2xl font-serif text-stone-900">
                      {formatCurrency(order.totalPence, order.currency)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-stone-500">
                      View Details
                      <ChevronDown size={14} strokeWidth={1.5} className="transition-transform duration-300 group-open:rotate-180" />
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-stone-200 px-6 md:px-8 pb-8 pt-6 space-y-8">
                <div>
                  <h4 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4">Items</h4>
                  <div className="divide-y divide-stone-200 border-y border-stone-200">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-stone-900">{item.name}</p>
                          <p className="text-sm text-stone-600 font-light">
                            {item.quantity} × {formatCurrency(item.pricePence, order.currency)}
                          </p>
                        </div>
                        <p className="text-sm text-stone-900">
                          {formatCurrency(item.quantity * item.pricePence, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                  <div className="border border-stone-200 bg-[#faf9f6] p-6">
                    <h4 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4">Billing Snapshot</h4>
                    {order.billingSnapshot ? (
                      <div className="text-sm text-stone-600 font-light leading-relaxed">
                        {order.billingSnapshot.name ? <p>{order.billingSnapshot.name}</p> : null}
                        {order.billingSnapshot.email ? <p>{order.billingSnapshot.email}</p> : null}
                        {order.billingSnapshot.phoneNumber ? <p>{order.billingSnapshot.phoneNumber}</p> : null}
                        {order.billingSnapshot.line1 ? <p className="mt-3">{order.billingSnapshot.line1}</p> : null}
                        {order.billingSnapshot.line2 ? <p>{order.billingSnapshot.line2}</p> : null}
                        <p>
                          {[order.billingSnapshot.city, order.billingSnapshot.state, order.billingSnapshot.postcode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {order.billingSnapshot.country ? <p>{order.billingSnapshot.country}</p> : null}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-600 font-light leading-relaxed">
                        Billing details were not captured for this order snapshot.
                      </p>
                    )}
                  </div>

                  <div className="min-w-[12rem] border-t border-stone-300 pt-4">
                    <div className="flex items-center justify-between gap-6 text-sm text-stone-600 mb-3">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotalPence, order.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6 text-lg font-serif text-stone-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalPence, order.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function AddressForm({
  draft,
  errors,
  busy,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
}: {
  draft: AccountAddressInput;
  errors: Errors;
  busy: boolean;
  submitLabel: string;
  onChange: (key: keyof AccountAddressInput, value: string | boolean) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="border border-stone-200 bg-white/80 p-6 md:p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TextField id="address-label" label="Label" value={draft.label} onChange={(value) => onChange('label', value)} error={errors.label} />
        <TextField id="address-full-name" label="Full Name" value={draft.fullName} onChange={(value) => onChange('fullName', value)} error={errors.fullName} autoComplete="name" />
        <TextField id="address-phone-number" label="Phone Number" value={draft.phoneNumber} onChange={(value) => onChange('phoneNumber', value)} error={errors.phoneNumber} type="tel" autoComplete="tel" />
        <TextField id="address-country" label="Country" value={draft.country} onChange={(value) => onChange('country', value)} error={errors.country} autoComplete="country-name" />
        <TextField id="address-line-1" label="Address Line 1" value={draft.line1} onChange={(value) => onChange('line1', value)} error={errors.line1} autoComplete="address-line1" />
        <TextField id="address-line-2" label="Address Line 2" value={draft.line2} onChange={(value) => onChange('line2', value)} error={errors.line2} autoComplete="address-line2" />
        <TextField id="address-city" label="City / Town" value={draft.city} onChange={(value) => onChange('city', value)} error={errors.city} autoComplete="address-level2" />
        <TextField id="address-state" label="County / State" value={draft.state} onChange={(value) => onChange('state', value)} error={errors.state} autoComplete="address-level1" />
        <TextField id="address-postcode" label="Postcode / ZIP" value={draft.postcode} onChange={(value) => onChange('postcode', value)} error={errors.postcode} autoComplete="postal-code" />
      </div>

      <CheckboxField
        id="address-default"
        label="Make this the default address"
        checked={draft.isDefault}
        onChange={(value) => onChange('isDefault', value)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-3 bg-stone-900 text-[#faf9f6] px-8 py-4 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Saving Address
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-sm tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SavedAddressesSection({
  addresses,
  onAddressesUpdate,
  profile,
}: {
  addresses: AccountAddress[];
  onAddressesUpdate: (addresses: AccountAddress[]) => void;
  profile: AccountProfile;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountAddressInput>(emptyAddressInput);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('success');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const editingAddress = useMemo(
    () => addresses.find((address) => address.id === editingAddressId) ?? null,
    [addresses, editingAddressId],
  );

  function openAddAddressForm() {
    setIsAdding(true);
    setEditingAddressId(null);
    setDraft({
      ...emptyAddressInput,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? '',
    });
    setErrors({});
    setMessage('');
    setMessageTone('success');
  }

  function resetForm() {
    setIsAdding(false);
    setEditingAddressId(null);
    setDraft(emptyAddressInput);
    setErrors({});
  }

  async function saveAddress(url: string, method: 'POST' | 'PATCH') {
    setBusyAction(method === 'POST' ? 'create' : 'update');
    setErrors({});
    setMessage('');
    setMessageTone('success');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draft),
      });
      const data = await readJson(response);

      if (!response.ok || !data.addresses) {
        setErrors(data.errors ?? {});
        setMessageTone('error');
        setMessage(data.message ?? 'The address could not be saved.');
        return;
      }

      onAddressesUpdate(data.addresses);
      setMessageTone('success');
      setMessage(editingAddressId ? 'Address updated.' : 'Address added.');
      resetForm();
    } catch {
      setMessageTone('error');
      setMessage('The address could not be saved right now.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete(addressId: string) {
    setBusyAction(`delete:${addressId}`);
    setMessage('');
    setMessageTone('success');

    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: 'DELETE',
      });
      const data = await readJson(response);

      if (!response.ok || !data.addresses) {
        setMessageTone('error');
        setMessage(data.message ?? 'The address could not be removed.');
        return;
      }

      onAddressesUpdate(data.addresses);
      setMessageTone('success');
      setMessage('Address removed.');
      if (editingAddressId === addressId) {
        resetForm();
      }
    } catch {
      setMessageTone('error');
      setMessage('The address could not be removed right now.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSetDefault(address: AccountAddress) {
    setBusyAction(`default:${address.id}`);
    setMessage('');
    setMessageTone('success');

    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...toAddressInput(address),
          isDefault: true,
        }),
      });
      const data = await readJson(response);

      if (!response.ok || !data.addresses) {
        setMessageTone('error');
        setMessage(data.message ?? 'The default address could not be updated.');
        return;
      }

      onAddressesUpdate(data.addresses);
      setMessageTone('success');
      setMessage('Default address updated.');
    } catch {
      setMessageTone('error');
      setMessage('The default address could not be updated right now.');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section id="addresses" className="border-t border-stone-200 pt-12">
      <SectionHeading
        eyebrow="Delivery"
        title="Saved Addresses"
        description="Keep billing and delivery details ready for a smoother checkout experience."
      />

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <StatusMessage tone={messageTone} message={message} />
          <button
            type="button"
            onClick={openAddAddressForm}
            className="w-max text-sm tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
          >
            Add Address
          </button>
        </div>

        {(isAdding || editingAddress) ? (
          <AddressForm
            draft={draft}
            errors={errors}
            busy={busyAction === 'create' || busyAction === 'update'}
            submitLabel={editingAddress ? 'Save Changes' : 'Save Address'}
            onChange={(key, value) => setDraft((current) => ({ ...current, [key]: value }))}
            onCancel={resetForm}
            onSubmit={(event) => {
              event.preventDefault();

              if (editingAddressId) {
                void saveAddress(`/api/account/addresses/${editingAddressId}`, 'PATCH');
              } else {
                void saveAddress('/api/account/addresses', 'POST');
              }
            }}
          />
        ) : null}

        {addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            description="Add your preferred billing or delivery address to speed up future checkouts."
            action={
              <button
                type="button"
                onClick={openAddAddressForm}
                className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-[#faf9f6] text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors"
              >
                Add First Address
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {addresses.map((address) => (
              <article key={address.id} className="border border-stone-200 bg-white/75 p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-3">{address.label}</span>
                    <h3 className="text-2xl font-serif text-stone-900">{address.fullName || 'Address'}</h3>
                  </div>
                  {address.isDefault ? (
                    <span className="inline-flex items-center border border-stone-300 bg-[#faf9f6] px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-stone-700">
                      Default
                    </span>
                  ) : null}
                </div>

                <div className="text-sm text-stone-600 font-light leading-relaxed space-y-1">
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>{[address.city, address.state, address.postcode].filter(Boolean).join(', ')}</p>
                  <p>{address.country}</p>
                  {address.phoneNumber ? <p className="pt-2">{address.phoneNumber}</p> : null}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(address.id);
                      setIsAdding(false);
                      setDraft(toAddressInput(address));
                      setErrors({});
                    }}
                    className="text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
                  >
                    Edit
                  </button>
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => void handleSetDefault(address)}
                      disabled={busyAction === `default:${address.id}`}
                      className="text-xs tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {busyAction === `default:${address.id}` ? 'Saving Default' : 'Set as Default'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                    disabled={busyAction === `delete:${address.id}`}
                    className="text-xs tracking-[0.2em] uppercase text-[var(--elanoire-color-destructive)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {busyAction === `delete:${address.id}` ? 'Removing' : 'Remove'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsSection() {
  return (
    <section id="settings" className="border-t border-stone-200 pt-12">
      <SectionHeading
        eyebrow="Settings"
        title="Settings"
        description="Keep account security close at hand, and surface future communication controls without pretending they are already live."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <article className="border border-stone-200 bg-white/80 p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={18} strokeWidth={1.5} className="text-stone-900" />
            <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Security</span>
          </div>
          <h3 className="text-2xl font-serif text-stone-900 mb-4">Password & session</h3>
          <p className="text-sm text-stone-600 font-light leading-relaxed mb-8">
            Request a password reset when needed, or end your session from this section.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/forgot-password"
              className="text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
            >
              Reset Password
            </Link>
            <SignOutButton />
          </div>
        </article>

        <div className="space-y-6">
          {[
            {
              title: 'Communication Preferences',
              description: 'Newsletter and invitation controls will live here once preference storage is connected.',
            },
            {
              title: 'Order Notifications',
              description: 'Shipment and delivery notification controls are staged and intentionally muted until the backend is ready.',
            },
          ].map((item) => (
            <article key={item.title} className="border border-stone-200 bg-white/80 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif text-stone-900 mb-3">{item.title}</h3>
                <p className="text-sm text-stone-600 font-light leading-relaxed max-w-xl">{item.description}</p>
              </div>
              <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Pending</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AccountDashboard({ initialData }: { initialData: AccountDashboardData }) {
  const [profile, setProfile] = useState(initialData.profile);
  const [addresses, setAddresses] = useState(initialData.addresses);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-16 lg:gap-24 items-start mb-24">
        <div>
          <span className="text-xs font-medium tracking-[0.35em] uppercase text-stone-500 mb-6 block">
            Account
          </span>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight tracking-wide text-stone-900 mb-8">
            Your Élanoire space.
          </h1>
          <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
            A calm home for profile details, order history, saved addresses, and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {accountSections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.title} className="border-t border-stone-300 pt-6">
                <Icon size={22} strokeWidth={1.5} className="text-stone-900 mb-6" />
                <h2 className="text-xl font-serif text-stone-900 mb-3">
                  {section.title}
                </h2>
                <p className="text-sm text-stone-600 font-light leading-relaxed">
                  {section.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-20">
        <ProfileSection profile={profile} onProfileUpdate={setProfile} />
        <OrdersSection orders={initialData.orders} />
        <SavedAddressesSection profile={profile} addresses={addresses} onAddressesUpdate={setAddresses} />
        <SettingsSection />
      </div>
    </>
  );
}
