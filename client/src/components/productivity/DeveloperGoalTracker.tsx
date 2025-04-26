import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, PlusCircle, Target, X, Trophy, Calendar, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Goal {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'abandoned';
  category: 'coding' | 'learning' | 'project' | 'career';
}

interface DeveloperGoalTrackerProps {
  showAddButton?: boolean;
  compact?: boolean;
}

export const DeveloperGoalTracker: React.FC<DeveloperGoalTrackerProps> = ({ 
  showAddButton = true,
  compact = false
}) => {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    category: 'coding'
  });
  const { toast } = useToast();

  // Fetch user's goals
  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/productivity/goals'],
    retry: false,
    enabled: true,
  });

  // Sample goals if data isn't loaded yet
  const sampleGoals: Goal[] = [
    {
      id: 1,
      title: 'Learn TypeScript generics',
      description: 'Master advanced TypeScript concepts',
      progress: 70,
      priority: 'high',
      status: 'active',
      category: 'learning',
      deadline: '2025-05-15'
    },
    {
      id: 2,
      title: 'Implement CI/CD pipeline',
      description: 'Setup automated testing and deployment',
      progress: 30,
      priority: 'medium',
      status: 'active',
      category: 'project',
      deadline: '2025-05-20'
    },
    {
      id: 3,
      title: 'Refactor authentication service',
      progress: 100,
      priority: 'high',
      status: 'completed',
      category: 'coding'
    }
  ];

  // Get goals to display
  const displayGoals = (goals as Goal[]) || sampleGoals;
  const activeGoals = displayGoals.filter(goal => goal.status === 'active');
  const completedGoals = displayGoals.filter(goal => goal.status === 'completed');
  
  // Calculate days remaining for a deadline
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Add new goal mutation
  const addGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await fetch('/api/productivity/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add goal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal added successfully!",
        description: "Your new development goal has been added.",
      });
      setIsAddGoalOpen(false);
      setNewGoal({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        category: 'coding'
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update goal progress mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      const response = await fetch(`/api/productivity/goals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update goal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress updated",
        description: "Your goal progress has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoalMutation.mutate({
      ...newGoal,
      progress: 0,
      status: 'active'
    });
  };

  // Handle goal completion
  const handleComplete = (id: number) => {
    updateGoalMutation.mutate({ id, progress: 100 });
  };

  // Priority badge color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Category badge color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'coding':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'learning':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'project':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'career':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Render goal item
  const renderGoalItem = (goal: Goal) => {
    const isCompleted = goal.status === 'completed';
    const daysLeft = goal.deadline ? getDaysRemaining(new Date(goal.deadline)) : null;
    
    return (
      <div key={goal.id} className="mb-4 last:mb-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-start gap-2">
            <Checkbox 
              checked={isCompleted}
              onCheckedChange={() => handleComplete(goal.id)}
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className={isCompleted ? "line-through text-muted-foreground" : "font-medium"}>
                  {goal.title}
                </span>
              </div>
              {!compact && goal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {goal.category}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
              {goal.priority}
            </Badge>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="pl-7">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">
                {goal.progress}% complete
              </span>
              {goal.deadline && (
                <span className={`text-xs ${daysLeft && daysLeft < 3 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {daysLeft === 0 ? 'Due today' : 
                   daysLeft && daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : 
                   daysLeft ? `${daysLeft} days left` : ''}
                </span>
              )}
            </div>
            <Progress value={goal.progress} className="h-1.5" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {activeGoals.length === 0 && !isLoading ? (
        <div className="text-center py-6">
          <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-lg font-medium mb-1">No active goals</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a goal to track your development progress
          </p>
          <Button onClick={() => setIsAddGoalOpen(true)} className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Goal
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1 mb-4">
            {activeGoals.map(renderGoalItem)}
          </div>
          
          {!compact && completedGoals.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Completed Goals</span>
              </div>
              <div className="space-y-2">
                {completedGoals.slice(0, 3).map(renderGoalItem)}
              </div>
              
              {completedGoals.length > 3 && (
                <Button variant="link" size="sm" className="mt-2 h-7 p-0">
                  View all completed goals
                </Button>
              )}
            </div>
          )}
          
          {showAddButton && (
            <div className="mt-4">
              <Button 
                onClick={() => setIsAddGoalOpen(true)} 
                variant="outline" 
                size="sm"
                className="w-full justify-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> 
                Add Goal
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Development Goal</DialogTitle>
            <DialogDescription>
              Create a new goal to track your development progress.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddGoal}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Learn React Hooks" 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Brief description of your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input 
                  id="deadline" 
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Goal Category</Label>
                <RadioGroup 
                  defaultValue={newGoal.category}
                  onValueChange={(value: any) => setNewGoal({...newGoal, category: value})}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="coding" id="category-coding" />
                    <Label htmlFor="category-coding">Coding</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="learning" id="category-learning" />
                    <Label htmlFor="category-learning">Learning</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="project" id="category-project" />
                    <Label htmlFor="category-project">Project</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="career" id="category-career" />
                    <Label htmlFor="category-career">Career</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <RadioGroup 
                  defaultValue={newGoal.priority}
                  onValueChange={(value: any) => setNewGoal({...newGoal, priority: value})}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="low" id="priority-low" />
                    <Label htmlFor="priority-low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="medium" id="priority-medium" />
                    <Label htmlFor="priority-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="high" id="priority-high" />
                    <Label htmlFor="priority-high">High</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addGoalMutation.isPending}>
                {addGoalMutation.isPending ? 'Adding...' : 'Add Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperGoalTracker;