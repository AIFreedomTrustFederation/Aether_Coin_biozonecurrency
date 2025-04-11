import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Star, Loader2 } from "lucide-react";

// Feedback types
const feedbackTypes = [
  { value: "helpful", label: "Helpful", description: "The response was accurate and useful" },
  { value: "not_helpful", label: "Not Helpful", description: "The response wasn't useful but not wrong" },
  { value: "incorrect", label: "Incorrect", description: "The response contained errors or misinformation" },
  { value: "offensive", label: "Offensive", description: "The response was inappropriate or harmful" },
  { value: "other", label: "Other", description: "Other type of feedback" }
];

// Zod schema for form validation
const feedbackFormSchema = z.object({
  feedbackType: z.enum(["helpful", "not_helpful", "incorrect", "offensive", "other"], {
    required_error: "Please select a feedback type",
  }),
  qualityRating: z.number().min(1).max(5),
  feedbackText: z.string().min(10, "Feedback must be at least 10 characters").max(2000, "Feedback must not exceed 2000 characters"),
  responseId: z.string(),
  promptText: z.string(),
  responseText: z.string(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface AIFeedbackFormProps {
  responseId: string;
  promptText: string;
  responseText: string;
  onFeedbackSubmitted?: () => void;
}

const AIFeedbackForm: React.FC<AIFeedbackFormProps> = ({
  responseId,
  promptText,
  responseText,
  onFeedbackSubmitted
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);

  // Initialize the form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedbackType: "helpful",
      qualityRating: 3,
      feedbackText: "",
      responseId,
      promptText,
      responseText,
    },
  });

  // Submit handler
  const onSubmit = async (values: FeedbackFormValues) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/ai-training/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbackCompleted(true);
        setShowForm(false);
        
        toast({
          title: 'Feedback submitted!',
          description: data.message || 'Thank you for helping train Mysterion AI',
        });
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      } else {
        throw new Error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Conversion function for slider to display stars
  const displayStars = (value: number) => {
    return '★'.repeat(value) + '☆'.repeat(5 - value);
  };

  if (feedbackCompleted) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl">Thank You!</CardTitle>
          <CardDescription className="text-center">
            Your feedback helps make Mysterion AI better for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="text-center">
            <Star className="h-16 w-16 text-primary mx-auto mb-2" />
            <p className="text-lg font-medium">Feedback recorded</p>
            <p className="text-sm text-muted-foreground">
              You've earned SING tokens for your contribution!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            Provide More Feedback
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mysterion AI Feedback</CardTitle>
        <CardDescription>
          Help improve Mysterion AI by providing feedback on this response
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="feedbackType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How would you rate this response?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-1"
                    >
                      {feedbackTypes.map((type) => (
                        <FormItem
                          key={type.value}
                          className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted"
                        >
                          <FormControl>
                            <RadioGroupItem value={type.value} />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="font-medium">{type.label}</FormLabel>
                            <FormDescription className="text-xs">
                              {type.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quality Rating */}
            <FormField
              control={form.control}
              name="qualityRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate the quality (1-5 stars)</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">1</span>
                      <span className="text-sm font-medium">
                        {displayStars(form.getValues().qualityRating)}
                      </span>
                      <span className="text-xs text-muted-foreground">5</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Feedback */}
            <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide specific details about what was good, bad, or could be improved..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your detailed feedback helps train the AI more effectively
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden fields */}
            <input type="hidden" {...form.register("responseId")} />
            <input type="hidden" {...form.register("promptText")} />
            <input type="hidden" {...form.register("responseText")} />

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Your feedback will be used to train Mysterion AI and you'll receive SING tokens as a reward.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AIFeedbackForm;