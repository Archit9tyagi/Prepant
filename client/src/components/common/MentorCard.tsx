import React, { useState } from 'react';
import { Heart, CheckCircle2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { RatingStars } from './RatingStars.js';
import { PriceTag } from './PriceTag.js';
import type { MentorCardData } from '../../types/index.js';
import { cn } from '../../lib/utils.js';

interface MentorCardProps {
  mentor: MentorCardData;
  onBookTrial?: (mentor: MentorCardData) => void;
  onMessage?: (mentor: MentorCardData) => void;
  onToggleFavorite?: (slug: string, isFav: boolean) => void;
  className?: string;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onBookTrial,
  onMessage,
  onToggleFavorite,
  className,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFavorite;
    setIsFavorite(next);
    onToggleFavorite?.(mentor.slug, next);
  };

  const isVerified = mentor.badges?.includes('verified');

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300',
        className,
      )}
    >
      <div>
        {/* Header: Avatar, Name, Badges, Heart */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 rounded-full border border-slate-100 shadow-xs">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback>{mentor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {mentor.name}
                </h3>
                {isVerified && (
                  <CheckCircle2 className="h-4 w-4 text-primary-600 fill-primary-50" />
                )}
              </div>
              <p className="line-clamp-1 text-xs text-slate-500 font-medium">{mentor.headline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Save to favorites"
          >
            <Heart className={cn('h-5 w-5', isFavorite && 'fill-red-500 text-red-500')} />
          </button>
        </div>

        {/* Stats row: Rating, reviews, sessions taught */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <RatingStars rating={mentor.ratingAvg} count={mentor.ratingCount} size="sm" />
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-600">
            {mentor.sessionsTaught.toLocaleString()} sessions
          </span>
        </div>

        {/* Bio */}
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600">{mentor.bio}</p>

        {/* Subjects chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mentor.subjects.slice(0, 3).map((sub) => (
            <Badge key={sub} variant="secondary" className="text-[11px] font-medium">
              {sub}
            </Badge>
          ))}
          {mentor.subjects.length > 3 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{mentor.subjects.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price, Trial, Action Buttons */}
      <div className="mt-5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <PriceTag paise={mentor.hourlyRatePaise} />
          {mentor.trialEnabled && mentor.trialPricePaise && (
            <PriceTag paise={mentor.trialPricePaise} perHour={false} trial />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage?.(mentor)}
            className="w-full gap-1.5 text-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>

          <Button
            size="sm"
            onClick={() => onBookTrial?.(mentor)}
            className="w-full text-xs font-bold"
          >
            Book trial
          </Button>
        </div>
      </div>
    </div>
  );
};
