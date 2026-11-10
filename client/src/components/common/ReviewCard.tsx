import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
import { RatingStars } from './RatingStars.js';
import type { ReviewData } from '../../types/index.js';
import { cn } from '../../lib/utils.js';

interface ReviewCardProps {
  review: ReviewData;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, className }) => {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-slate-200 bg-white p-5 shadow-xs space-y-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.studentAvatar} alt={review.studentName} />
            <AvatarFallback>{review.studentName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{review.studentName}</h4>
            <span className="text-xs text-slate-400">{review.createdAt}</span>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      <p className="text-xs leading-relaxed text-slate-600">{review.comment}</p>

      {review.mentorReply && (
        <div className="rounded-[10px] bg-slate-50 border-l-2 border-primary-500 p-3 mt-2 text-xs">
          <p className="font-semibold text-slate-800 mb-0.5">Mentor response:</p>
          <p className="text-slate-600">{review.mentorReply.text}</p>
        </div>
      )}
    </div>
  );
};
