
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PhotoUploader from '@/components/PhotoUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  // For demo purposes, hardcoded credentials
  // In a real app, this would use Supabase auth
  const mockLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation (in real app, this would be server-side)
      if (email === 'admin@example.com' && password === 'password') {
        setIsAuthenticated(true);
        localStorage.setItem('babyapp_auth', 'true');
        toast({
          title: "Success",
          description: "You've successfully logged in",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('babyapp_auth');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
  };

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('babyapp_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUploadComplete = () => {
    toast({
      title: "Success",
      description: `Photo for Month ${selectedMonth} has been uploaded`,
    });
  };

  return (
    <Layout showBackButton title="Admin Panel">
      <div className="max-w-md mx-auto">
        {!isAuthenticated ? (
          <Card className="p-6 bg-white/90 rounded-xl">
            <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              mockLogin(email, password);
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Demo credentials: admin@example.com / password
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Upload Photos</h2>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="month-select">Select Month</Label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full mt-1 rounded-md border border-gray-300 p-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                ))}
              </select>
            </div>
            
            <PhotoUploader month={selectedMonth} onUploadComplete={handleUploadComplete} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
