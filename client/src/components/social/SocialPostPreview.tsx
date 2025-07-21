import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share, ThumbsUp } from 'lucide-react';
import type { Post } from '@shared/schema';

interface SocialPostPreviewProps {
  post: Post & { 
    branch?: { name: string }; 
    creator?: { firstName?: string; lastName?: string };
  };
  platform?: 'facebook' | 'instagram' | 'twitter';
}

const platformConfig = {
  facebook: {
    name: 'Facebook',
    color: 'bg-blue-500',
    icon: 'f',
    interactions: ['👍', '💬', '📤'],
    labels: ['likes', 'comments', 'shares'],
  },
  instagram: {
    name: 'Instagram',
    color: 'bg-pink-500',
    icon: '📸',
    interactions: ['❤️', '💬', '📤'],
    labels: ['likes', 'comments', 'shares'],
  },
  twitter: {
    name: 'Twitter',
    color: 'bg-blue-400',
    icon: '🐦',
    interactions: ['🔄', '❤️', '💬'],
    labels: ['retweets', 'likes', 'replies'],
  },
};

export function SocialPostPreview({ post, platform = 'facebook' }: SocialPostPreviewProps) {
  const config = platformConfig[platform];
  const creatorName = post.creator
    ? `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim()
    : 'EduConnect';

  // Mock engagement metrics
  const engagementMetrics = {
    facebook: [24, 8, 3],
    instagram: [42, 12, 7],
    twitter: [18, 31, 6],
  };

  const metrics = engagementMetrics[platform];

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-8 h-8 ${config.color} rounded flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{config.icon}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{creatorName}</p>
            <p className="text-xs text-gray-500">
              {post.publishedAt
                ? `Posted ${formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}`
                : post.scheduledFor
                ? `Scheduled for ${new Date(post.scheduledFor).toLocaleString()}`
                : 'Draft'}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full h-32 object-cover rounded mb-3"
          />
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {post.branch && (
            <Badge variant="outline" className="text-xs">
              📍 {post.branch.name}
            </Badge>
          )}
          
          <div className="flex space-x-4">
            {config.interactions.map((emoji, index) => (
              <span key={index}>
                {emoji} {metrics[index]} {config.labels[index]}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
