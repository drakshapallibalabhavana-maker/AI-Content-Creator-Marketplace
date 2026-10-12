import React from 'react';
import { VerificationLevel } from '@/types';
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  level: VerificationLevel;
  type?: 'creator' | 'tool' | 'workflow' | 'work';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({
  level,
  type = 'creator',
  showLabel = true,
  size = 'md',
}: Props) {
  const configs = {
    verified: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      label: 'Verified Creator',
      tooltip: 'Operational audit passed: active tool subscriptions and production evidence confirmed by human reviewer.',
    },
    evidence_submitted: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: FileCheck,
      label: 'Evidence Submitted',
      tooltip: 'Workflow documentation and generation invoices submitted. Review pending.',
    },
    self_declared: {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: ShieldCheck,
      label: 'Self-Declared',
      tooltip: 'Profile credentials declared by creator; independent audit not yet performed.',
    },
    rejected: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertCircle,
      label: 'Needs Revision',
      tooltip: 'Submitted evidence did not meet the verification integrity standards.',
    },
  };

  const current = configs[level] || configs.self_declared;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border font-medium ${current.bg} ${sizeClasses} transition-all`}
      title={current.tooltip}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} />
      {showLabel && <span>{current.label}</span>}
    </div>
  );
}
