import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/hooks/useAuth';

const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['announcement', 'news', 'social']),
  isPublished: z.boolean().default(false),
  socialPlatforms: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface PostFormProps {
  open: boolean;
  onClose: () => void;
}

export function PostForm({ open, onClose }: PostFormProps) {
  const { t } = useLanguage();
  const { selectedBranchId } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'announcement',
      isPublished: false,
      socialPlatforms: [],
      imageUrl: '',
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      const response = await apiRequest('POST', '/api/posts', {
        ...data,
        branchId: selectedBranchId,
        createdBy: (user as any)?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/social'] });
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const socialPlatformOptions = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'twitter', label: 'Twitter/X' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createPost') || 'Create New Post'}</DialogTitle>
          <DialogDescription>
            Create a new post to share with your school community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Social Media Platforms</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatformOptions.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
                    name="socialPlatforms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(platform.id)}
                            onCheckedChange={(checked) => {
                              const updatedPlatforms = checked
                                ? [...(field.value || []), platform.id]
                                : (field.value || []).filter((p) => p !== platform.id);
                              field.onChange(updatedPlatforms);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {platform.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Publish immediately
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending}
                className="bg-primary-700 hover:bg-primary-800"
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}