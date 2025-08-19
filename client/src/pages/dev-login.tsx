import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, buildUrl } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function DevLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAutoLogin = async () => {
    try {
      setIsLoading(true);
      // Add timestamp to bust cache
      const response = await fetch(buildUrl(`/api/login?t=${Date.now()}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        setLocation('/');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Auto-login failed. Please try manual login.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during auto-login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/dev/login', formData);
      toast({
        title: 'Login Successful',
        description: 'Welcome to SchoolSphere',
      });
      // Redirect to dashboard
      setLocation('/');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Developer Login</CardTitle>
          <CardDescription>
            Enter your credentials to sign in to the development environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="admin@demo.school"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAutoLogin}
            disabled={isLoading}
          >
            Auto Login as Demo Admin
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-gray-500 text-center">
            <p>Dev Credentials:</p>
            <p>Admin: admin@demo.school / demo123</p>
            <p>Teacher: teacher@demo.school / demo123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
