export type View = 'landing' | 'overview' | 'power' | 'converter' | 'inventory' | 'provisioning' | 'mttr' | 'fault' | 'splicing' | 'stock' | 'customers' | 'monitoring' | 'history' | 'jobs' | 'settings';

export type Reading = {
  id: number;
  value: number;
  label: string;
  date: string;
  status: string;
};

export type ToastFn = (message: string) => void;
