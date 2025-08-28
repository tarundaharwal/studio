import { Rss, Users, MessageSquare, Flame } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from '@/components/ui/avatar';

const discussions = [
  {
    id: 1,
    title: 'How to effectively backtest a mean-reversion strategy?',
    author: 'A. Sharma',
    authorInitials: 'AS',
    replies: 12,
    category: 'Strategies',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Best practices for risk management in volatile markets',
    author: 'P. Gupta',
    authorInitials: 'PG',
    replies: 8,
    category: 'Risk Management',
    time: '5 hours ago',
  },
  {
    id: 3,
    title: 'Share your favorite custom indicators for TradingView',
    author: 'R. Singh',
    authorInitials: 'RS',
    replies: 25,
    category: 'Tools',
    time: '1 day ago',
  },
  {
    id: 4,
    title: 'Discussion on the impact of global news on NIFTY50',
    author: 'V. Kumar',
    authorInitials: 'VK',
    replies: 5,
    category: 'Market Analysis',
    time: '2 days ago',
  },
];

export default function CommunityPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Community Hub</h2>
          <p className="text-muted-foreground">
            Connect, share, and learn with fellow traders.
          </p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Start a Discussion
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                  <Rss className="mr-2 h-4 w-4" /> All Discussions
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Flame className="mr-2 h-4 w-4" /> Popular
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Users className="mr-2 h-4 w-4" /> My Posts
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${discussion.author}`} />
                      <AvatarFallback>{discussion.authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <a href="#" className="font-semibold hover:underline">
                        {discussion.title}
                      </a>
                      <div className="text-xs text-muted-foreground">
                        Posted by {discussion.author} • {discussion.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge variant="outline">{discussion.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3"/>
                        {discussion.replies}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
