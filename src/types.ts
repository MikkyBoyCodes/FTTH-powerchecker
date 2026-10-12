export type View = 'overview' | 'power' | 'converter' | 'history' | 'jobs';
export type Reading = { id: number; value: number; label: string; date: string; status: string };
export type ToastFn = (message: string) => void;
