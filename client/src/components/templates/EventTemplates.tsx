import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Trophy, 
  Music, 
  GraduationCap, 
  Heart, 
  Users,
  Search,
  Plus
} from 'lucide-react';

type EventTemplate = {
  id: string;
  name: string;
  category: 'academic' | 'sports' | 'cultural' | 'social' | 'fundraising';
  icon: any;
  title: string;
  description: string;
  suggestedDuration: number; // in hours
  suggestedLocation: string;
  defaultReminders: number[]; // days before event
  socialMediaTemplate: string;
  emailTemplate: string;
  tags: string[];
};

const eventTemplates: EventTemplate[] = [
  {
    id: 'science-fair',
    name: 'Science Fair',
    category: 'academic',
    icon: GraduationCap,
    title: 'Annual Science Fair',
    description: 'Join us for an exciting showcase of student scientific projects and innovations. Students will present their research and experiments.',
    suggestedDuration: 4,
    suggestedLocation: 'School Gymnasium',
    defaultReminders: [7, 3, 1],
    socialMediaTemplate: '🔬 Science Fair Alert! Our talented students are ready to showcase their amazing projects. Come see the future scientists in action! #ScienceFair #Education #Innovation',
    emailTemplate: 'Dear Parents,\n\nWe are excited to invite you to our Annual Science Fair where students will display their creativity and scientific knowledge. Your support means everything to our young scientists!\n\nBest regards,\nThe School Team',
    tags: ['science', 'academic', 'exhibition', 'students']
  },
  {
    id: 'sports-tournament',
    name: 'Sports Tournament',
    category: 'sports',
    icon: Trophy,
    title: 'Inter-School Sports Tournament',
    description: 'Cheer for our teams in an exciting multi-sport tournament featuring basketball, football, and track events.',
    suggestedDuration: 6,
    suggestedLocation: 'Sports Complex',
    defaultReminders: [14, 7, 1],
    socialMediaTemplate: '🏆 Game Day! Our athletes are ready to compete in the Inter-School Tournament. Come support our teams! #Sports #Tournament #GoTeam',
    emailTemplate: 'Dear School Community,\n\nGet ready for an action-packed sports tournament! Our students have been training hard and are excited to compete. Come cheer them on!\n\nSports Committee',
    tags: ['sports', 'competition', 'athletics', 'tournament']
  },
  {
    id: 'cultural-night',
    name: 'Cultural Night',
    category: 'cultural',
    icon: Music,
    title: 'International Cultural Night',
    description: 'Experience the rich diversity of our school community through music, dance, food, and traditional performances.',
    suggestedDuration: 3,
    suggestedLocation: 'School Auditorium',
    defaultReminders: [10, 5, 2],
    socialMediaTemplate: '🌍 Cultural Night is here! Join us for an evening celebrating our diverse community with performances, food, and fun! #CulturalNight #Diversity #Community',
    emailTemplate: 'Dear Families,\n\nYou are cordially invited to our International Cultural Night. Come celebrate the beautiful diversity of our school community!\n\nCultural Committee',
    tags: ['culture', 'diversity', 'performance', 'international']
  },
  {
    id: 'parent-teacher',
    name: 'Parent-Teacher Conference',
    category: 'academic',
    icon: Users,
    title: 'Parent-Teacher Conference',
    description: 'Meet with your child\'s teachers to discuss academic progress, achievements, and goals for the upcoming term.',
    suggestedDuration: 8,
    suggestedLocation: 'Individual Classrooms',
    defaultReminders: [14, 7, 3, 1],
    socialMediaTemplate: '👨‍👩‍👧‍👦 Parent-Teacher Conferences are coming up! Book your slot to discuss your child\'s progress with their teachers. #ParentTeacher #Education #StudentProgress',
    emailTemplate: 'Dear Parents,\n\nParent-Teacher Conference scheduling is now open. Please book your time slots to meet with your child\'s teachers.\n\nAcademic Office',
    tags: ['parents', 'teachers', 'academic', 'meeting']
  },
  {
    id: 'fundraiser',
    name: 'Charity Fundraiser',
    category: 'fundraising',
    icon: Heart,
    title: 'Community Charity Drive',
    description: 'Join our school community in supporting local charities through various fundraising activities and donations.',
    suggestedDuration: 2,
    suggestedLocation: 'School Courtyard',
    defaultReminders: [21, 14, 7, 3],
    socialMediaTemplate: '❤️ Giving back to our community! Join our charity fundraiser and help make a difference. Every contribution counts! #Charity #Community #GivingBack',
    emailTemplate: 'Dear School Community,\n\nWe invite you to participate in our charity fundraiser. Together, we can make a positive impact in our community.\n\nCommunity Service Team',
    tags: ['charity', 'fundraising', 'community', 'service']
  }
];

const categoryColors = {
  academic: 'bg-blue-100 text-blue-800',
  sports: 'bg-green-100 text-green-800',
  cultural: 'bg-purple-100 text-purple-800',
  social: 'bg-orange-100 text-orange-800',
  fundraising: 'bg-red-100 text-red-800',
};

interface EventTemplatesProps {
  onSelectTemplate: (template: EventTemplate) => void;
  onCreateCustom: () => void;
}

export function EventTemplates({ onSelectTemplate, onCreateCustom }: EventTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = eventTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'academic', 'sports', 'cultural', 'social', 'fundraising'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Event Templates</h2>
        <Button onClick={onCreateCustom} className="bg-primary-700 text-white hover:bg-primary-800">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Event
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = template.icon;
          const categoryColor = categoryColors[template.category];
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{template.suggestedDuration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{template.suggestedLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reminders:</span>
                    <span>{template.defaultReminders.join(', ')} days</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => onSelectTemplate(template)}
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}