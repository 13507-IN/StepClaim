'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Clock, Loader2, Search, Compass, Inbox } from 'lucide-react';
import { socialService } from '@/services/social.service';
import { useToast } from '@/components/ui/toast';
import { UserCard } from '@/components/shared/user-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FriendsPage() {
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();
  
  // Tabs & Search states
  const [activeTab, setActiveTab] = useState<'LIST' | 'PENDING' | 'SEARCH'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────────────

  // Query accepted friends list
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends-list'],
    queryFn: async () => {
      const res = await socialService.getFriends();
      return res.data || [];
    },
    enabled: activeTab === 'LIST',
  });

  // Query pending sent/received requests
  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const res = await socialService.getPendingRequests();
      return res.data || { incoming: [], outgoing: [] };
    },
    enabled: activeTab === 'PENDING',
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (username: string) => socialService.sendFriendRequest(username),
    onSuccess: () => {
      success('Invitation Sent', 'Friend request dispatched successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
    },
    onError: (err: any) => {
      error('Failed to Send', err.response?.data?.message || 'Error sending request');
    },
  });

  // Accept/Decline request mutation
  const respondMutation = useMutation({
    mutationFn: (payload: { requestId: string; action: 'ACCEPT' | 'DECLINE' | 'BLOCK' }) =>
      socialService.respondToRequest(payload.requestId, payload.action),
    onSuccess: (_, variables) => {
      success('Invitation Handled', `Friend request ${variables.action.toLowerCase()}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ['friends-list'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
    onError: (err: any) => {
      error('Failed to Respond', err.response?.data?.message || 'Error responding to request');
    },
  });

  // ─── Search Handlers ───────────────────────────────────────────────────────

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await socialService.searchUsers(searchQuery);
      if (res.success && res.data) {
        setSearchResults(res.data);
        if (res.data.length === 0) {
          info('Search Results', 'No users found matching your query');
        }
      }
    } catch (err) {
      error('Search Error', 'Failed to search player directory');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header Section ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
          Friends
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Form workout networks, coordinate maps strategies, and monitor friends feed milestones.
        </p>
      </div>

      {/* ─── Tab Switcher ──────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <div className="border-b border-white/5 pb-2">
          <TabsList>
            <TabsTrigger value="LIST" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Friends List
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5" />
              Invites Received
              {pending?.incoming && pending.incoming.length > 0 && (
                <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 bg-purple-600 rounded-full text-white font-mono animate-pulse">
                  {pending.incoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="SEARCH" className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Find Players
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Tab Content: Friends List ────────────────────────────────────────── */}
        <TabsContent value="LIST" className="pt-4">
          {friendsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : !friends || friends.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No Friends Added"
              message="Social competition is the heart of StepClaim. Find and add workout friends to track their progression!"
              actionText="Search Players"
              onAction={() => setActiveTab('SEARCH')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  user={friend}
                  relationshipStatus="FRIENDS"
                  onAction={() => {}} // already friends
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Tab Content: Pending Invites ──────────────────────────────────────── */}
        <TabsContent value="PENDING" className="pt-4 space-y-4">
          {pendingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Incoming invites */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Requests</h4>
                {!pending || !pending.incoming || pending.incoming.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No pending received invites</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pending.incoming.map((req: any) => (
                      <UserCard
                        key={req.id}
                        user={req.requester}
                        relationshipStatus="PENDING_RECEIVED"
                        onAction={() => respondMutation.mutate({ requestId: req.id, action: 'ACCEPT' })}
                        loading={respondMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing invites */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outgoing Requests</h4>
                {!pending || !pending.outgoing || pending.outgoing.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No pending sent invites</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pending.outgoing.map((req: any) => (
                      <UserCard
                        key={req.id}
                        user={req.receiver}
                        relationshipStatus="PENDING_SENT"
                        onAction={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── Tab Content: Directory Search ────────────────────────────────────── */}
        <TabsContent value="SEARCH" className="pt-4 space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="e.g. shadow_conqueror"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searchLoading} className="px-5">
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Search Listings */}
          <div className="space-y-3">
            {searchResults.length > 0 && (
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Results</h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((searchUser) => (
                <UserCard
                  key={searchUser.id}
                  user={searchUser}
                  relationshipStatus="NONE"
                  onAction={() => sendRequestMutation.mutate(searchUser.username)}
                  loading={sendRequestMutation.isPending}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
