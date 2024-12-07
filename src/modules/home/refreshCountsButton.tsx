
"use client";
import { useTransition } from "react";
import { refreshCounts } from "@/lib/actions";

interface RefreshCountsButtonProps {
  onRefresh: (shopCount: number, productCount: number) => void;
}

export default function RefreshCountsButton({ onRefresh }: RefreshCountsButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function handleRefresh() {
    startTransition(async () => {
      const { shopCount, productCount } = await refreshCounts();
      onRefresh(shopCount, productCount);
    });
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="border-black border-2 py-2 px-4 rounded"
    >
      {isPending ? "Refreshing..." : "Refresh Counts"}
    </button>
  );
}
