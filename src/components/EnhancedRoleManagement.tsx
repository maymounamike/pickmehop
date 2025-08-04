import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Smartphone, 
  QrCode, 
  Copy, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { RoleIndicator } from '@/components/RoleIndicator';

interface TwoFactorSetup {
  qrCodeUri: string;
  backupCodes: string[];
}

export const EnhancedRoleManagement = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .order('role', { ascending: true });

      if (roleData && roleData.length > 0) {
        const roles = roleData.map(r => r.role);
        const priorityRole = roles.includes('admin') ? 'admin' : 
                            roles.includes('driver') ? 'driver' :
                            roles.includes('partner') ? 'partner' : 'user';
        setUserRole(priorityRole);

        // Check 2FA status for admins
        if (priorityRole === 'admin') {
          const { data: twoFactorData } = await supabase
            .from('admin_2fa')
            .select('enabled')
            .eq('user_id', session.user.id)
            .single();

          setTwoFactorEnabled(twoFactorData?.enabled || false);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setActionLoading('setup');
    try {
      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'setup' }
      });

      if (error) throw error;

      setTwoFactorSetup(data);
      toast({
        title: "2FA Setup Initiated",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken) {
      toast({
        title: "Error",
        description: "Please enter verification token",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('verify');
    try {
      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { 
          action: 'verify',
          token: verificationToken 
        }
      });

      if (error) throw error;

      setTwoFactorEnabled(true);
      setTwoFactorSetup(null);
      setVerificationToken('');
      
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationToken) {
      toast({
        title: "Error",
        description: "Please enter verification token to disable 2FA",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('disable');
    try {
      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { 
          action: 'disable',
          token: verificationToken 
        }
      });

      if (error) throw error;

      setTwoFactorEnabled(false);
      setVerificationToken('');
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard"
    });
  };

  const getSecurityLevel = (role: string, has2FA: boolean) => {
    if (role === 'admin' && has2FA) return { level: 'Maximum', color: 'bg-green-100 text-green-800' };
    if (role === 'admin' && !has2FA) return { level: 'Critical', color: 'bg-red-100 text-red-800' };
    if (role === 'driver') return { level: 'Enhanced', color: 'bg-orange-100 text-orange-800' };
    if (role === 'partner') return { level: 'Business', color: 'bg-blue-100 text-blue-800' };
    return { level: 'Standard', color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const securityLevel = getSecurityLevel(userRole || 'user', twoFactorEnabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Account Security</h1>
            <p className="text-muted-foreground">Manage your role and security settings</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RoleIndicator role={userRole || 'user'} />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Badge className={securityLevel.color}>
                {securityLevel.level} Security
              </Badge>
            </div>

            {userRole === 'admin' && !twoFactorEnabled && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 font-medium">
                  Two-factor authentication is required for admin accounts
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <Label>User ID</Label>
                    <Input value={user.id} disabled />
                  </div>
                </div>
                <div>
                  <Label>Account Created</Label>
                  <Input value={new Date(user.created_at).toLocaleDateString()} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              {userRole === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Two-Factor Authentication
                      {twoFactorEnabled && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Secure your admin account with TOTP authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!twoFactorEnabled && !twoFactorSetup && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Two-factor authentication adds an extra layer of security to your admin account.
                        </p>
                        <Button 
                          onClick={handleSetup2FA}
                          disabled={actionLoading === 'setup'}
                          className="w-full"
                        >
                          {actionLoading === 'setup' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Smartphone className="mr-2 h-4 w-4" />
                          )}
                          Set Up Two-Factor Authentication
                        </Button>
                      </div>
                    )}

                    {twoFactorSetup && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-medium mb-2">Scan QR Code</h4>
                          <div className="inline-block p-4 bg-white border rounded-lg">
                            <QrCode className="h-32 w-32 mx-auto" />
                            <p className="text-xs text-muted-foreground mt-2">
                              QR Code would be displayed here
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Backup Codes</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Save these codes safely</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowBackupCodes(!showBackupCodes)}
                              >
                                {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            {showBackupCodes && (
                              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                                {twoFactorSetup.backupCodes.map((code, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center justify-between p-2 bg-white rounded cursor-pointer"
                                    onClick={() => copyToClipboard(code)}
                                  >
                                    <span>{code}</span>
                                    <Copy className="h-3 w-3" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Verification Token</Label>
                          <Input
                            placeholder="Enter 6-digit code from your app"
                            value={verificationToken}
                            onChange={(e) => setVerificationToken(e.target.value)}
                            maxLength={6}
                          />
                        </div>

                        <Button 
                          onClick={handleVerify2FA}
                          disabled={!verificationToken || actionLoading === 'verify'}
                          className="w-full"
                        >
                          {actionLoading === 'verify' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Verify and Enable 2FA
                        </Button>
                      </div>
                    )}

                    {twoFactorEnabled && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Two-factor authentication is active
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Label>Verification Token (to disable)</Label>
                          <Input
                            placeholder="Enter token to disable 2FA"
                            value={verificationToken}
                            onChange={(e) => setVerificationToken(e.target.value)}
                          />
                        </div>

                        <Button 
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={!verificationToken || actionLoading === 'disable'}
                          className="w-full"
                        >
                          {actionLoading === 'disable' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <AlertTriangle className="mr-2 h-4 w-4" />
                          )}
                          Disable Two-Factor Authentication
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Password Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Password Security</CardTitle>
                  <CardDescription>
                    Manage your account password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Your current roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RoleIndicator role={userRole || 'user'} />
                    <div>
                      <p className="font-medium">Primary Role</p>
                      <p className="text-sm text-muted-foreground">
                        {userRole === 'admin' && 'Full administrative access'}
                        {userRole === 'driver' && 'Driver portal access'}
                        {userRole === 'partner' && 'Business partner access'}
                        {userRole === 'user' && 'Standard customer access'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>

                {userRole === 'admin' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Admin Privileges</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• User management and role assignment</li>
                      <li>• Driver approval and verification</li>
                      <li>• Partner management and contracts</li>
                      <li>• System settings and configuration</li>
                      <li>• Financial reports and analytics</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};