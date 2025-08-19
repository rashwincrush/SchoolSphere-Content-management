import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  TrendingUp, 
  Clock,
  Users,
  Heart,
  MessageCircle,
  BarChart3
} from 'lucide-react';
import { buildUrl } from '@/lib/queryClient';

export default function Social() {
  const { t } = useLanguage();
  const { selectedBranchId } = useBranch();

  const { data: posts = [] } = useQuery({
    queryKey: ['/api/posts', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/posts?branchId=${selectedBranchId}` : '/api/posts';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const { data: socialStats } = useQuery({
    queryKey: ['/api/analytics/social', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/analytics?branchId=${selectedBranchId}` : '/api/analytics/overview';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.social;
    },
  });

  const publishedPosts = Array.isArray(posts) ? posts.filter((post: any) => post.status === 'published') : [];
  const draftPosts = Array.isArray(posts) ? posts.filter((post: any) => post.status === 'draft') : [];

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
          Social Media Management
        </h1>
        <p className="text-gray-600">
          Manage social media posts and view engagement analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Share2 className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{socialStats?.totalPosts || posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-success-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{socialStats?.recentPosts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-error-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{socialStats?.engagement || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reach</p>
                <p className="text-2xl font-bold text-gray-900">2.4K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Published Posts</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {publishedPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {publishedPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <Badge variant="default">Published</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 50)}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 20)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No published posts yet.</p>
              <Button variant="outline" onClick={() => window.location.href = '/content'}>
                Create Your First Post
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          {draftPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {draftPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <Badge variant="secondary">Draft</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      
                      <Button size="sm" variant="outline">
                        Edit Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No draft posts.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No scheduled posts.</p>
            <p className="text-sm text-gray-500">
              Schedule posts to be automatically published at specific times.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Platform Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Facebook className="w-5 h-5 text-blue-600 mr-2" />
                      <span>Facebook</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">1.2K</p>
                      <p className="text-sm text-gray-500">followers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Twitter className="w-5 h-5 text-blue-400 mr-2" />
                      <span>Twitter</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">850</p>
                      <p className="text-sm text-gray-500">followers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Instagram className="w-5 h-5 text-pink-600 mr-2" />
                      <span>Instagram</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">2.1K</p>
                      <p className="text-sm text-gray-500">followers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Detailed analytics coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
