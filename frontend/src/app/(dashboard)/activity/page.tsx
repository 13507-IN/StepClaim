'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, Footprints, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { socialService } from '@/services/social.service';
import { ActivityItem } from '@/components/shared/activity-item';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ActivityFeedPage() {
  const [page, setPage] = useState(1);
  const limit = 15;

  // Query social activities feed
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['activity-feed', page],
    queryFn: async () => {
      const res = await socialService.getActivityFeed(page, limit);
      return res.data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* ─── Header Section ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-cyan-400" />
          Activity Feed
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Chronological highlights of fitness achievements, level-ups, and territory captures across your friends network.
        </p>
      </div>

      {/* ─── Timeline Feed Content ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Timeline Empty"
            message="No activities recorded on your feed. Add friends or step outside to capture sectors to fill your timeline!"
          />
        ) : (
          <div className="space-y-3">
            {data.map((act: any, idx: number) => (
              <ActivityItem key={act.id} activity={act} delay={idx * 0.04} />
            ))}

            {/* Simple Pagination controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isFetching}
                className="border-white/5 bg-white/5 hover:bg-white/10"
              >
                Previous Page
              </Button>
              <span className="text-xs font-mono text-slate-500 font-bold">
                Page {page}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={data.length < limit || isFetching}
                className="border-white/5 bg-white/5 hover:bg-white/10"
              >
                Next Page
                {isFetching && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
