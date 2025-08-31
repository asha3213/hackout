import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Zap, 
  Recycle, 
  TrendingUp, 
  Shield,
  Factory,
  Eye,
  ExternalLink,
  X,
  Activity
} from 'lucide-react';
import * as api from '../services/api';
import { useApp } from '../contexts/AppContext';

export default function Dashboard() {
  const { currentAccount } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [retirements, setRetirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentAccount) return;
      
      try {
        const [eventsRes, balanceRes, blockRes, retirementsRes] = await Promise.all([
          api.listEvents(),
          api.getAccountBalance(currentAccount.id),
          api.getLatestBlock(),
          api.getRetirementsReport(),
        ]);
        
        setEvents(eventsRes.data);
        setBalance(balanceRes.data);
        setLatestBlock(blockRes.data);
        setRetirements(retirementsRes.data.retirements || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentAccount]);

  const totalCredits = balance?.balance_g || 0;
  const verifiedEvents = events.filter(e => e.verified).length;
  const totalRetired = retirements.reduce((sum, r) => sum + (r.amount_g || 0), 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'verified':
      case 'issued':
        return 'verified';
      case 'pending':
        return 'pending';
      case 'retired':
        return 'retired';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-gradient">Green Hydrogen</span>
          <br />
          <span className="text-white">Credit System</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Transparent, verifiable, and immutable tracking of green hydrogen production credits
        </p>
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg inline-block">
          <p className="text-sm text-gray-400">
            Logged in as: <span className="text-energy-400 font-medium">{currentAccount?.name}</span>
            <span className="text-gray-500 ml-2">({currentAccount?.role})</span>
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="energy-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Your Balance</CardTitle>
              <Zap className="h-4 w-4 text-energy-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalCredits.toLocaleString()}</div>
              <p className="text-xs text-gray-400">grams H₂</p>
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
              <CardTitle className="text-sm font-medium text-gray-400">Verified Events</CardTitle>
              <Activity className="h-4 w-4 text-hydrogen-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{verifiedEvents}</div>
              <p className="text-xs text-gray-400">events</p>
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
              <CardTitle className="text-sm font-medium text-gray-400">Retired</CardTitle>
              <Recycle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalRetired.toLocaleString()}</div>
              <p className="text-xs text-gray-400">grams H₂</p>
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
              <CardTitle className="text-sm font-medium text-gray-400">Latest Block</CardTitle>
              <Shield className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {latestBlock ? `#${latestBlock.tx_count}` : 'None'}
              </div>
              <p className="text-xs text-gray-400">transactions</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-white">Recent Events</CardTitle>
            <CardDescription>Latest hydrogen production events and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-white">
                        {event.hydrogen_kg} kg H₂
                      </span>
                      <Badge variant={event.verified ? 'verified' : 'pending'}>
                        {event.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400">
                      ELX: {event.electrolyzer_id} • 
                      {event.energy_kwh} kWh • 
                      {new Date(event.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.verified && (
                      <Shield className="w-5 h-5 text-energy-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}