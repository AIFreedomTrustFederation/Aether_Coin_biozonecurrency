import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Code, Brain, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

// Form schema
const activityFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional(),
  category: z.enum(['coding', 'learning', 'planning', 'meeting', 'review', 'other']),
  duration: z.coerce.number().min(1, { message: 'Duration must be at least 1 minute.' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Date must be in YYYY-MM-DD format.' 
  })
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

const ActivityForm: React.FC = () => {
  const { toast } = useToast();

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Form setup
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'coding',
      duration: 30,
      date: getCurrentDate()
    }
  });

  // Submit activity mutation
  const mutation = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      const response = await fetch('/api/productivity/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to log activity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity logged successfully!",
        description: "Your development activity has been recorded.",
      });
      form.reset({
        title: '',
        description: '',
        category: 'coding',
        duration: 30,
        date: getCurrentDate()
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ActivityFormValues) => {
    mutation.mutate(data);
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding':
        return <Code className="h-4 w-4" />;
      case 'learning':
        return <Brain className="h-4 w-4" />;
      case 'planning':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Log Development Activity
        </CardTitle>
        <CardDescription>
          Record your development activities to track productivity and identify patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Implementing API endpoints" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="coding" className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <span>Coding</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="learning">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span>Learning</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="planning">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Planning</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="review">Code Review</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you accomplished or learned" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add any details about what you worked on
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Log Activity'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;