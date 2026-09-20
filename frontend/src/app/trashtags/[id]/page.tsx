'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TrashTagDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/recovery/${id}`);
    } else {
      router.replace('/explore');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-emerald-400">Loading Hotspot Detail...</span>
    </div>
  );
}

