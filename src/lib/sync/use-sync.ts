"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { syncAll, getPendingSyncCount } from "./engine";

export function useSync() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const doSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncAll();
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    // Initial sync
    doSync();

    // Sync every 30 seconds
    intervalRef.current = setInterval(doSync, 30000);

    // Sync when coming online
    function handleOnline() {
      doSync();
    }
    window.addEventListener("online", handleOnline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("online", handleOnline);
    };
  }, [doSync]);

  return { pendingCount, isSyncing, syncNow: doSync };
}
