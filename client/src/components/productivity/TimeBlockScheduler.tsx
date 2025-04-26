import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, X, Clock, Calendar, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, Code, Brain, Book, FileText, Coffee, Layout, Check } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

// TimeBlock interface
interface TimeBlock {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string; 
  category: 'coding' | 'learning' | 'planning' | 'meeting' | 'break' | 'other';
  completed: boolean;
}

const TimeBlockScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    date: formatDateForInput(currentDate),
    category: 'coding',
    completed: false
  });

  const { toast } = useToast();

  // Format date as YYYY-MM-DD for input fields
  function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Format date for display (e.g., "Monday, April 25")
  function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // Navigate to previous day/week
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next day/week
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Navigate to today
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Get dates for week view
  const getWeekDates = () => {
    const dates = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Fetch time blocks
  const { data: timeBlocks, isLoading } = useQuery({
    queryKey: ['/api/productivity/timeblocks', formatDateForInput(currentDate), viewMode],
    retry: false,
    enabled: true,
  });

  // Sample time blocks if data isn't loaded yet
  const sampleTimeBlocks: TimeBlock[] = [
    {
      id: 1,
      title: 'Implement API endpoints',
      description: 'Create RESTful endpoints for user authentication',
      startTime: '09:00',
      endTime: '11:00',
      date: formatDateForInput(currentDate),
      category: 'coding',
      completed: false
    },
    {
      id: 2,
      title: 'Team meeting',
      startTime: '11:30',
      endTime: '12:30',
      date: formatDateForInput(currentDate),
      category: 'meeting',
      completed: true
    },
    {
      id: 3,
      title: 'Learn React Query',
      description: 'Study data fetching with React Query',
      startTime: '13:30',
      endTime: '15:00',
      date: formatDateForInput(currentDate),
      category: 'learning',
      completed: false
    },
    {
      id: 4,
      title: 'Coffee break',
      startTime: '15:00',
      endTime: '15:30',
      date: formatDateForInput(currentDate),
      category: 'break',
      completed: true
    }
  ];

  // Time block mutations
  const addTimeBlockMutation = useMutation({
    mutationFn: async (blockData: any) => {
      const response = await fetch('/api/productivity/timeblocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add time block');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Time block added",
        description: "Your time block has been scheduled.",
      });
      setAddModalOpen(false);
      resetNewTimeBlock();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTimeBlockMutation = useMutation({
    mutationFn: async (blockData: any) => {
      const response = await fetch(`/api/productivity/timeblocks/${blockData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update time block');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Time block updated",
        description: "Your time block has been updated.",
      });
      setEditModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset new time block form
  const resetNewTimeBlock = () => {
    setNewTimeBlock({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      date: formatDateForInput(currentDate),
      category: 'coding',
      completed: false
    });
  };

  // Handle add time block
  const handleAddTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addTimeBlockMutation.mutate(newTimeBlock);
  };

  // Handle edit time block
  const handleEditTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlock) {
      updateTimeBlockMutation.mutate(selectedBlock);
    }
  };

  // Handle mark as complete
  const handleToggleComplete = (block: TimeBlock) => {
    updateTimeBlockMutation.mutate({
      ...block,
      completed: !block.completed
    });
  };

  // Open edit modal
  const openEditModal = (block: TimeBlock) => {
    setSelectedBlock(block);
    setEditModalOpen(true);
  };

  // Get display time blocks for the selected date
  const getDisplayTimeBlocks = () => {
    const displayBlocks = (timeBlocks as TimeBlock[] || sampleTimeBlocks);
    
    if (viewMode === 'day') {
      return displayBlocks.filter(block => block.date === formatDateForInput(currentDate));
    } else {
      const weekDates = getWeekDates().map(date => formatDateForInput(date));
      return displayBlocks.filter(block => weekDates.includes(block.date));
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'learning':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'planning':
        return <Layout className="h-4 w-4 text-green-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'break':
        return <Coffee className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Render the time block form (shared between add and edit)
  const renderTimeBlockForm = (isEditing: boolean) => (
    <form onSubmit={isEditing ? handleEditTimeBlock : handleAddTimeBlock} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit' : 'add'}-title`}>Title</Label>
        <Input 
          id={`${isEditing ? 'edit' : 'add'}-title`} 
          placeholder="e.g., Implement authentication" 
          value={isEditing ? selectedBlock?.title : newTimeBlock.title}
          onChange={(e) => isEditing 
            ? setSelectedBlock({...selectedBlock!, title: e.target.value})
            : setNewTimeBlock({...newTimeBlock, title: e.target.value})
          }
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${isEditing ? 'edit' : 'add'}-description`}>Description (Optional)</Label>
        <Textarea 
          id={`${isEditing ? 'edit' : 'add'}-description`} 
          placeholder="What will you work on?" 
          value={isEditing ? selectedBlock?.description || '' : newTimeBlock.description}
          onChange={(e) => isEditing 
            ? setSelectedBlock({...selectedBlock!, description: e.target.value})
            : setNewTimeBlock({...newTimeBlock, description: e.target.value})
          }
          className="resize-none h-20"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEditing ? 'edit' : 'add'}-date`}>Date</Label>
          <Input 
            id={`${isEditing ? 'edit' : 'add'}-date`} 
            type="date" 
            value={isEditing ? selectedBlock?.date : newTimeBlock.date}
            onChange={(e) => isEditing 
              ? setSelectedBlock({...selectedBlock!, date: e.target.value})
              : setNewTimeBlock({...newTimeBlock, date: e.target.value})
            }
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={isEditing ? selectedBlock?.category : newTimeBlock.category}
            onValueChange={(value: any) => isEditing 
              ? setSelectedBlock({...selectedBlock!, category: value})
              : setNewTimeBlock({...newTimeBlock, category: value})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEditing ? 'edit' : 'add'}-start-time`}>Start Time</Label>
          <Input 
            id={`${isEditing ? 'edit' : 'add'}-start-time`} 
            type="time" 
            value={isEditing ? selectedBlock?.startTime : newTimeBlock.startTime}
            onChange={(e) => isEditing 
              ? setSelectedBlock({...selectedBlock!, startTime: e.target.value})
              : setNewTimeBlock({...newTimeBlock, startTime: e.target.value})
            }
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${isEditing ? 'edit' : 'add'}-end-time`}>End Time</Label>
          <Input 
            id={`${isEditing ? 'edit' : 'add'}-end-time`} 
            type="time" 
            value={isEditing ? selectedBlock?.endTime : newTimeBlock.endTime}
            onChange={(e) => isEditing 
              ? setSelectedBlock({...selectedBlock!, endTime: e.target.value})
              : setNewTimeBlock({...newTimeBlock, endTime: e.target.value})
            }
            required
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => isEditing ? setEditModalOpen(false) : setAddModalOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isEditing ? updateTimeBlockMutation.isPending : addTimeBlockMutation.isPending}
        >
          {isEditing 
            ? (updateTimeBlockMutation.isPending ? 'Updating...' : 'Update Schedule') 
            : (addTimeBlockMutation.isPending ? 'Scheduling...' : 'Schedule')}
        </Button>
      </DialogFooter>
    </form>
  );

  // Render time blocks for day view
  const renderDayTimeBlocks = () => {
    const displayBlocks = getDisplayTimeBlocks()
      .filter(block => block.date === formatDateForInput(currentDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (displayBlocks.length === 0) {
      return (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-lg font-medium mb-1">No scheduled blocks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your day by adding time blocks
          </p>
          <Button onClick={() => setAddModalOpen(true)} className="mt-2">
            <Plus className="h-4 w-4 mr-2" /> Add Time Block
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-2">
        {displayBlocks.map(block => (
          <Card key={block.id} className={`overflow-hidden transition-colors duration-200 ${block.completed ? 'bg-muted/30' : ''}`}>
            <div className="flex">
              <div className={`w-1.5 ${getCategoryColor(block.category)}`} />
              <CardContent className="flex-grow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(block.category)}
                      <h4 className={`font-medium ${block.completed ? 'text-muted-foreground line-through' : ''}`}>
                        {block.title}
                      </h4>
                    </div>
                    {block.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {block.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-sm whitespace-nowrap">
                      {block.startTime} - {block.endTime}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleToggleComplete(block)}
                    >
                      {block.completed ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => openEditModal(block)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render time blocks for week view
  const renderWeekTimeBlocks = () => {
    const weekDates = getWeekDates();
    const displayBlocks = getDisplayTimeBlocks();
    
    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {weekDates.map((date, index) => {
          const dateStr = formatDateForInput(date);
          const dayBlocks = displayBlocks.filter(block => block.date === dateStr);
          const isToday = new Date().toDateString() === date.toDateString();
          
          return (
            <div key={index} className={`border rounded-md p-2 ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="text-center mb-2">
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayBlocks.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-xs text-muted-foreground">No blocks</div>
                  </div>
                ) : (
                  dayBlocks
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(block => (
                      <div 
                        key={block.id} 
                        className={`p-1.5 rounded text-xs border-l-2 ${getCategoryBorder(block.category)} ${block.completed ? 'line-through opacity-50' : ''}`}
                        onClick={() => openEditModal(block)}
                      >
                        <div className="font-medium truncate">{block.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {block.startTime} - {block.endTime}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Get category color for the sidebar
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'coding':
        return 'bg-blue-500';
      case 'learning':
        return 'bg-purple-500';
      case 'planning':
        return 'bg-green-500';
      case 'meeting':
        return 'bg-yellow-500';
      case 'break':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get category border for week view
  const getCategoryBorder = (category: string) => {
    switch (category) {
      case 'coding':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'learning':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'planning':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'meeting':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'break':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Time Block Scheduler</CardTitle>
          <CardDescription>
            Plan your development activities with focused time blocks
          </CardDescription>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Block
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigatePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToday}
              className="h-8"
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={navigateNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-medium ml-2">
              {viewMode === 'day' 
                ? formatDateForDisplay(currentDate)
                : `Week of ${getWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDates()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              }
            </h3>
          </div>
          
          <Tabs 
            value={viewMode} 
            onValueChange={(v) => setViewMode(v as 'day' | 'week')}
            className="w-auto"
          >
            <TabsList className="grid w-[160px] grid-cols-2">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
              <div className="h-4 w-48 bg-muted rounded mb-3"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : (
          viewMode === 'day' ? renderDayTimeBlocks() : renderWeekTimeBlocks()
        )}
        
        <div className="flex flex-wrap gap-2 mt-6">
          <div className="text-sm font-medium mr-2">Categories:</div>
          {['coding', 'learning', 'planning', 'meeting', 'break', 'other'].map(category => (
            <div key={category} className="flex items-center gap-1 text-xs">
              <div className={`h-3 w-3 rounded-full ${getCategoryColor(category)}`}></div>
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Add Time Block Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Time Block</DialogTitle>
            <DialogDescription>
              Create a new time block for focused work or breaks.
            </DialogDescription>
          </DialogHeader>
          {renderTimeBlockForm(false)}
        </DialogContent>
      </Dialog>
      
      {/* Edit Time Block Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Block</DialogTitle>
            <DialogDescription>
              Update your scheduled time block.
            </DialogDescription>
          </DialogHeader>
          {selectedBlock && renderTimeBlockForm(true)}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TimeBlockScheduler;