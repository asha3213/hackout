'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  User, 
  Plus, 
  Users,
  CheckCircle2
} from 'lucide-react';
import * as api from '../services/api';
import { generateEd25519KeyPair } from '../services/crypto';
import { useApp } from '../contexts/AppContext';

export default function AccountSelector() {
  const { currentAccount, accounts, setCurrentAccount, setAccounts } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newAccount, setNewAccount] = useState({
    name: '',
    role: 'producer' as 'producer' | 'buyer' | 'verifier' | 'admin',
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await api.listAccounts();
        setAccounts(response.data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [setAccounts]);

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const keyPair = generateEd25519KeyPair();
      
      const accountData = {
        name: newAccount.name,
        role: newAccount.role,
        public_key_pem: keyPair.publicKeyPem,
      };

      const response = await api.createAccount(accountData);
      
      // Refresh accounts list
      const accountsRes = await api.listAccounts();
      setAccounts(accountsRes.data);
      
      // Reset form
      setNewAccount({ name: '', role: 'producer' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="energy-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gradient mb-4">
                Select Account
              </CardTitle>
              <CardDescription>
                Choose an account to access the hydrogen credit system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showCreateForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto">
                    {accounts.map((account, index) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                        onClick={() => setCurrentAccount(account)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{account.name}</span>
                          <Badge variant={
                            account.role === 'producer' ? 'verified' :
                            account.role === 'buyer' ? 'pending' :
                            account.role === 'verifier' ? 'warning' : 'outline'
                          }>
                            {account.role}
                          </Badge>
                        </div>
                        <code className="text-xs text-gray-400">
                          {account.id}
                        </code>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., GreenCo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountRole">Role</Label>
                    <select
                      id="accountRole"
                      value={newAccount.role}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="producer">Producer</option>
                      <option value="buyer">Buyer</option>
                      <option value="verifier">Verifier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateAccount}
                      variant="energy"
                      className="flex-1"
                      disabled={!newAccount.name || creating}
                    >
                      {creating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}