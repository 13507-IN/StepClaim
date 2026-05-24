'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    level: number;
  };
  relationshipStatus?: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
  onAction?: () => void;
  loading?: boolean;
  delay?: number;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  relationshipStatus = 'NONE',
  onAction,
  loading = false,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="w-full"
    >
      <Card className="border border-white/5 bg-white/3 hover:border-white/10 transition-all duration-300">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Level {user.level}</p>
            </div>
          </div>

          {/* Action Buttons based on Friend invitation state */}
          {onAction && (
            <div className="shrink-0">
              {relationshipStatus === 'NONE' && (
                <Button
                  size="sm"
                  onClick={onAction}
                  disabled={loading}
                  className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Add Friend
                </Button>
              )}
              {relationshipStatus === 'PENDING_SENT' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="text-slate-400 border-white/5 bg-white/5"
                >
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Sent
                </Button>
              )}
              {relationshipStatus === 'PENDING_RECEIVED' && (
                <Button
                  size="sm"
                  onClick={onAction}
                  disabled={loading}
                  className="bg-purple-600/10 border border-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Accept
                </Button>
              )}
              {relationshipStatus === 'FRIENDS' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Friends
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default UserCard;
