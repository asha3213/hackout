'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  Users, 
  Activity, 
  Blocks,
  RefreshCw,
  Eye,
  ExternalLink,
  Hash,
  Clock,
  CheckCircle2
} from 'lucide-react';
import * as api from '../services/api';

export default function AdminPanel() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [stateRoot, setStateRoot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [accountsRes, eventsRes, blockRes, stateRes] = await Promise.all([
        api.listAccounts(),
        api.listEvents(),
        api.getLatestBlock(),
        api.getStateRoot(),
      ]);

      setAccounts(accountsRes.data);
      setEvents(eventsRes.data);
      setLatestBlock(blockRes.data);
      setStateRoot(stateRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCloseBlock = async () => {
    try {
      await api.closeBlock({ note: 'Manual block close from admin panel' });
      await loadData();
    } catch (error) {
      console.error('Error closing block:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-gradient">Admin Dashboard</span>
        </h1>
        <p className="text-xl text-gray-400">
          System overview and database management
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button
            onClick={handleCloseBlock}
            variant="energy"
          >
            <Blocks className="w-4 h-4 mr-2" />
            Close Block
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="energy-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Accounts</CardTitle>
              <Users className="h-4 w-4 text-energy-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{accounts.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="hydrogen-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Production Events</CardTitle>
              <Activity className="h-4 w-4 text-hydrogen-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{events.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Latest Block</CardTitle>
              <Blocks className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {latestBlock ? `#${latestBlock.tx_count}` : 'None'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">State Root</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono text-white">
                {stateRoot ? `${stateRoot.state_root.slice(0, 8)}...` : 'Loading...'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-6 h-6 mr-2" />
                Accounts
              </CardTitle>
              <CardDescription>All registered accounts in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{account.name}</span>
                      <Badge variant={
                        account.role === 'producer' ? 'verified' :
                        account.role === 'buyer' ? 'pending' : 'outline'
                      }>
                        {account.role}
                      </Badge>
                    </div>
                    <code className="text-xs text-gray-400 block">
                      ID: {account.id}
                    </code>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="w-6 h-6 mr-2" />
                Recent Events
              </CardTitle>
              <CardDescription>Latest production events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.slice(0, 10).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {event.hydrogen_kg} kg H₂
                      </span>
                      <div className="flex items-center space-x-2">
                        {event.verified && (
                          <CheckCircle2 className="w-4 h-4 text-energy-500" />
                        )}
                        <Badge variant={event.verified ? 'verified' : 'outline'}>
                          {event.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      <div>ELX: {event.electrolyzer_id}</div>
                      <div>Energy: {event.energy_kwh} kWh</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Latest Block Info */}
      {latestBlock && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Blocks className="w-6 h-6 mr-2" />
                Latest Block
              </CardTitle>
              <CardDescription>Most recent block information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Block ID</h4>
                  <code className="text-sm text-energy-400">{latestBlock.block_id}</code>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Merkle Root</h4>
                  <code className="text-sm text-hydrogen-400">
                    {latestBlock.merkle_root.slice(0, 16)}...
                  </code>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Transactions</h4>
                  <span className="text-white font-semibold">{latestBlock.tx_count}</span>
                </div>
              </div>
              
              {latestBlock.anchor_tx && (
                <div className="mt-4 p-3 bg-energy-500/10 border border-energy-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-energy-500" />
                    <span className="text-sm text-energy-400">Anchored to blockchain</span>
                  </div>
                  <code className="text-xs text-gray-400 block mt-1">
                    TX: {latestBlock.anchor_tx}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* State Root Info */}
      {stateRoot && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Hash className="w-6 h-6 mr-2" />
                Sparse Merkle Tree State
              </CardTitle>
              <CardDescription>Current state root and tree information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">State Root</h4>
                  <code className="text-sm text-hydrogen-400 bg-white/5 p-2 rounded block">
                    {stateRoot.state_root}
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Hash Algorithm:</span>
                    <span className="text-white ml-2">{stateRoot.hash_algo}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tree Type:</span>
                    <span className="text-white ml-2">SMT (256-depth)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}