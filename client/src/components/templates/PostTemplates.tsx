import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Calendar, 
  Trophy, 
  GraduationCap, 
  Heart, 
  Megaphone,
  Search,
  Plus,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

type PostTemplate = {
  id: string;
  name: string;
  category: 'announcement' | 'event' | 'achievement' | 'academic' | 'emergency' | 'fundraising';
  icon: any;
  title: string;
  content: string;
  hashtags: string[];
  platforms: ('facebook' | 'twitter' | 'instagram')[];
  tone: 'formal' | 'casual' | 'urgent' | 'celebratory';
  suggestedImages: string[];
};

const postTemplates: PostTemplate[] = [
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    category: 'event',
    icon: Calendar,
    title: 'Join Us for [EVENT_NAME]!',
    content: 'We\'re excited to announce [EVENT_NAME] happening on [DATE] at [TIME]! \n\n📍 Location: [LOCATION]\n🎯 Who: [TARGET_AUDIENCE]\n\nDon\'t miss this amazing opportunity to [EVENT_BENEFIT]. Registration details coming soon!\n\n#[SCHOOL_NAME] #[EVENT_TYPE] #Community',
    hashtags: ['#Education', '#Community', '#Event', '#Students'],
    platforms: ['facebook', 'twitter', 'instagram'],
    tone: 'casual',
    suggestedImages: ['event-banner', 'school-campus', 'students-activity']
  },
  {
    id: 'academic-achievement',
    name: 'Academic Achievement',
    category: 'achievement',
    icon: GraduationCap,
    title: 'Celebrating Academic Excellence!',
    content: '🏆 Congratulations to [STUDENT_NAME/CLASS] for their outstanding achievement in [SUBJECT/COMPETITION]!\n\nWe\'re incredibly proud of their dedication, hard work, and commitment to excellence. This recognition reflects the quality education and support our school community provides.\n\n👏 Well done! Keep reaching for the stars!\n\n#AcademicExcellence #ProudMoment #Education',
    hashtags: ['#Achievement', '#Excellence', '#Education', '#ProudMoment'],
    platforms: ['facebook', 'twitter', 'instagram'],
    tone: 'celebratory',
    suggestedImages: ['award-ceremony', 'student-portrait', 'academic-success']
  },
  {
    id: 'sports-victory',
    name: 'Sports Victory',
    category: 'achievement',
    icon: Trophy,
    title: 'Victory on the Field!',
    content: '🏆 VICTORY! Our [TEAM_NAME] has won the [COMPETITION_NAME]!\n\nScore: [SCORE]\nOpponent: [OPPONENT]\nDate: [DATE]\n\nIncredible teamwork, dedication, and sportsmanship led to this fantastic win. Congratulations to our athletes and coaches!\n\n🎉 Go [TEAM_NAME]! #Champions',
    hashtags: ['#Sports', '#Victory', '#TeamWork', '#Champions'],
    platforms: ['facebook', 'twitter', 'instagram'],
    tone: 'celebratory',
    suggestedImages: ['team-celebration', 'trophy-shot', 'action-sports']
  },
  {
    id: 'emergency-notice',
    name: 'Emergency Notice',
    category: 'emergency',
    icon: Megaphone,
    title: 'Important Notice',
    content: '⚠️ IMPORTANT NOTICE ⚠️\n\n[EMERGENCY_DETAILS]\n\nAction Required: [ACTION_NEEDED]\nTimeline: [TIMELINE]\nContact: [CONTACT_INFO]\n\nPlease share this information with all family members. Thank you for your cooperation.\n\n#ImportantNotice #SchoolCommunity #Safety',
    hashtags: ['#Important', '#Notice', '#Safety', '#Community'],
    platforms: ['facebook', 'twitter'],
    tone: 'urgent',
    suggestedImages: ['official-notice', 'school-logo']
  },
  {
    id: 'fundraising-drive',
    name: 'Fundraising Drive',
    category: 'fundraising',
    icon: Heart,
    title: 'Support Our Cause',
    content: '❤️ Join us in making a difference! Our school is organizing a fundraising drive for [CAUSE].\n\n🎯 Goal: [FUNDRAISING_GOAL]\n📅 Duration: [START_DATE] - [END_DATE]\n💝 How to Help: [DONATION_METHODS]\n\nEvery contribution, big or small, makes a meaningful impact. Together, we can achieve great things!\n\n#CommunitySupport #Fundraising #MakingADifference',
    hashtags: ['#Fundraising', '#Community', '#Support', '#MakingADifference'],
    platforms: ['facebook', 'twitter', 'instagram'],
    tone: 'formal',
    suggestedImages: ['community-gathering', 'helping-hands', 'charity-event']
  },
  {
    id: 'academic-announcement',
    name: 'Academic Announcement',
    category: 'academic',
    icon: GraduationCap,
    title: 'Academic Update',
    content: '📚 Academic Announcement\n\n[ANNOUNCEMENT_DETAILS]\n\nImportant Dates:\n📅 [DATE_1]: [EVENT_1]\n📅 [DATE_2]: [EVENT_2]\n\nFor questions, please contact [CONTACT_PERSON] at [CONTACT_INFO].\n\n#Academics #Education #ImportantDates',
    hashtags: ['#Academic', '#Education', '#Students', '#Important'],
    platforms: ['facebook', 'twitter'],
    tone: 'formal',
    suggestedImages: ['classroom', 'academic-calendar', 'students-studying']
  }
];

const categoryColors = {
  announcement: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  achievement: 'bg-yellow-100 text-yellow-800',
  academic: 'bg-purple-100 text-purple-800',
  emergency: 'bg-red-100 text-red-800',
  fundraising: 'bg-pink-100 text-pink-800',
};

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
};

interface PostTemplatesProps {
  onSelectTemplate: (template: PostTemplate) => void;
  onCreateCustom: () => void;
}

export function PostTemplates({ onSelectTemplate, onCreateCustom }: PostTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = postTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'announcement', 'event', 'achievement', 'academic', 'emergency', 'fundraising'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Post Templates</h2>
        <Button onClick={onCreateCustom} className="bg-primary-700 text-white hover:bg-primary-800">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Post
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.tone}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{template.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-line">
                    {template.content}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Platforms:</span>
                    <div className="flex space-x-1">
                      {template.platforms.map(platform => {
                        const PlatformIcon = platformIcons[platform];
                        return (
                          <PlatformIcon key={platform} className="w-4 h-4" />
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.hashtags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.hashtags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.hashtags.length - 3}
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
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}