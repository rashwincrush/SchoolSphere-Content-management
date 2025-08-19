import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest, buildUrl } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { UserForm } from '@/components/users/UserForm';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  organizationId: number;
  branchId?: number;
  createdAt: string;
};

export default function Users() {
  const { t } = useLanguage();
  const { selectedBranchId } = useBranch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/users?branchId=${selectedBranchId}` : '/api/users';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/analytics/users', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/analytics/users/${selectedBranchId}` : '/api/analytics/users/';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      return apiRequest('PATCH', `/api/users/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User Deleted',
        description: 'User has been removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter users based on search and filters
  const filteredUsers = Array.isArray(users) ? users.filter((user: User) => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({ userId, updates: { role: newRole } });
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateUserMutation.mutate({ userId, updates: { status: newStatus } });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return 'default';
      case 'teacher':
        return 'secondary';
      case 'parent':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Loading users...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
              {t('users')}
            </h1>
            <p className="text-gray-600">
              Manage users and permissions across your organization
            </p>
          </div>
          
          <Button 
            className="bg-primary-700 text-white hover:bg-primary-800"
            onClick={() => setShowUserForm(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.totalUsers || users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(users) ? users.filter((u: User) => u.status === 'active').length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(users) ? users.filter((u: User) => u.role === 'teacher').length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.newThisMonth || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value) => handleStatusChange(user.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* User Form Dialog */}
      {showUserForm && (
        <UserForm
          open={showUserForm}
          onClose={() => setShowUserForm(false)}
        />
      )}
    </AppShell>
  );
}
