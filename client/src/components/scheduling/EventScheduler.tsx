import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  Clock, 
  Bell, 
  Share2, 
  Mail, 
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.date({ required_error: 'Start date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.date().optional(),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  category: z.enum(['academic', 'sports', 'cultural', 'social', 'fundraising']),
  maxAttendees: z.number().optional(),
  requiresRsvp: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  
  // Reminders
  enableReminders: z.boolean().default(true),
  reminderDays: z.array(z.number()).default([7, 3, 1]),
  
  // Social Media
  autoPostToSocial: z.boolean().default(false),
  socialPlatforms: z.array(z.enum(['facebook', 'twitter', 'instagram'])).default([]),
  socialMessage: z.string().optional(),
  
  // Email notifications
  sendEmailNotifications: z.boolean().default(true),
  emailSubject: z.string().optional(),
  emailMessage: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventSchedulerProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}

export function EventScheduler({ initialData, onSubmit, onCancel }: EventSchedulerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [customReminderDay, setCustomReminderDay] = useState('');

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      requiresRsvp: false,
      isPublic: true,
      enableReminders: true,
      reminderDays: [7, 3, 1],
      autoPostToSocial: false,
      socialPlatforms: [],
      sendEmailNotifications: true,
      ...initialData,
    },
  });

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
  };

  const addCustomReminder = () => {
    const days = parseInt(customReminderDay);
    if (days && days > 0) {
      const currentReminders = form.getValues('reminderDays');
      if (!currentReminders.includes(days)) {
        form.setValue('reminderDays', [...currentReminders, days].sort((a, b) => b - a));
      }
      setCustomReminderDay('');
    }
  };

  const removeReminder = (day: number) => {
    const currentReminders = form.getValues('reminderDays');
    form.setValue('reminderDays', currentReminders.filter(d => d !== day));
  };

  const socialPlatformIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Event</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            Schedule Event
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="fundraising">Fundraising</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your event..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requiresRsvp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Requires RSVP</FormLabel>
                            <FormDescription>
                              Attendees must confirm their attendance
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Public Event</FormLabel>
                            <FormDescription>
                              Visible to all school community members
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Event Reminders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Reminders</FormLabel>
                          <FormDescription>
                            Send automatic reminders before the event
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('enableReminders') && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Reminder Schedule</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {form.watch('reminderDays').map((day) => (
                            <Badge key={day} variant="secondary" className="flex items-center space-x-1">
                              <span>{day} day{day !== 1 ? 's' : ''} before</span>
                              <button
                                type="button"
                                onClick={() => removeReminder(day)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Days"
                            value={customReminderDay}
                            onChange={(e) => setCustomReminderDay(e.target.value)}
                            className="w-20"
                            min="1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomReminder}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Social Media Automation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoPostToSocial"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-post to Social Media</FormLabel>
                          <FormDescription>
                            Automatically share this event on social platforms
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('autoPostToSocial') && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Select Platforms</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {(['facebook', 'twitter', 'instagram'] as const).map((platform) => {
                            const IconComponent = socialPlatformIcons[platform];
                            const isSelected = form.watch('socialPlatforms').includes(platform);
                            
                            return (
                              <Button
                                key={platform}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                className="flex items-center space-x-2 h-12"
                                onClick={() => {
                                  const current = form.getValues('socialPlatforms');
                                  if (isSelected) {
                                    form.setValue('socialPlatforms', current.filter(p => p !== platform));
                                  } else {
                                    form.setValue('socialPlatforms', [...current, platform]);
                                  }
                                }}
                              >
                                <IconComponent className="w-4 h-4" />
                                <span className="capitalize">{platform}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="socialMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Media Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Custom message for social media posts..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty to use the auto-generated message
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sendEmailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Send Email Notifications</FormLabel>
                          <FormDescription>
                            Notify parents and students via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('sendEmailNotifications') && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="emailSubject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Custom email subject..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty to use auto-generated subject
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emailMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Custom email message..."
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Additional message to include in the email
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}