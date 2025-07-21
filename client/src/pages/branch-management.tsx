import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Building, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';

const branchFormSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type BranchFormData = z.infer<typeof branchFormSchema>;

export default function BranchManagement() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  const { data: branches = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const response = await apiRequest('POST', '/api/branches', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create branch',
        variant: 'destructive',
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BranchFormData }) => {
      const response = await apiRequest('PATCH', `/api/branches/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update branch',
        variant: 'destructive',
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/branches/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete branch',
        variant: 'destructive',
      });
    },
  });

  const handleCreateBranch = () => {
    setEditingBranch(null);
    form.reset();
    setShowBranchForm(true);
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
    });
    setShowBranchForm(true);
  };

  const handleCloseForm = () => {
    setShowBranchForm(false);
    setEditingBranch(null);
    form.reset();
  };

  const onSubmit = (data: BranchFormData) => {
    if (editingBranch) {
      updateBranchMutation.mutate({ id: editingBranch.id, data });
    } else {
      createBranchMutation.mutate(data);
    }
  };

  const handleDeleteBranch = (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      deleteBranchMutation.mutate(id);
    }
  };

  const isOwnerOrAdmin = ['owner', 'admin'].includes((user as any)?.role);

  if (!isOwnerOrAdmin) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage branches.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
              Branch Management
            </h1>
            <p className="text-gray-600">
              Manage all school branches and locations
            </p>
          </div>
          <Button
            onClick={handleCreateBranch}
            className="bg-primary-700 hover:bg-primary-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Branches</p>
                  <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-success-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Branches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {branches.filter(b => b.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-warning-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Plan Limit</p>
                  <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading branches...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No branches found. Create your first branch to get started.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          {branch.address && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {branch.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {branch.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {branch.phone}
                            </div>
                          )}
                          {branch.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {branch.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(branch.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Branch Form Dialog */}
        <Dialog open={showBranchForm} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
              </DialogTitle>
              <DialogDescription>
                {editingBranch ? 'Update branch information' : 'Add a new branch to your organization'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Campus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="123 Education St, City, State" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="branch@school.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                    className="bg-primary-700 hover:bg-primary-800"
                  >
                    {createBranchMutation.isPending || updateBranchMutation.isPending
                      ? 'Saving...'
                      : editingBranch
                      ? 'Update Branch'
                      : 'Create Branch'
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}