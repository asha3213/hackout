'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  ArrowRightLeft, 
  Recycle, 
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import * as api from '../services/api';
import { signMessage, canonicalJson } from '../services/crypto';
import { useApp } from '../contexts/AppContext';

export default function MarketPanel() {
  const { currentAccount } = useApp();
  const [offers, setOffers] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'retire'>('buy');

  // Form states
  const [sellForm, setSellForm] = useState({
    credit_id: '',
    amount_g: 0,
    price_per_g: 0.1,
  });

  const [buyForm, setBuyForm] = useState({
    offer_id: '',
    amount_g: 0,
  });

  const [retireForm, setRetireForm] = useState({
    credit_id: '',
    amount_g: 0,
    reason: '',
  });

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [offersRes] = await Promise.all([
          api.listMarketOffers(),
        ]);
        setOffers(offersRes.data.offers || []);

        // Load user's balance if account is available
        if (currentAccount) {
          const balanceRes = await api.getAccountBalance(currentAccount.id);
          setBalances([balanceRes.data]);
        }
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentAccount]);

  const handleCreateOffer = async () => {
    if (!currentAccount) return;

    setProcessing(true);
    try {
      const offerData = {
        producer_id: currentAccount.id,
        credit_id: sellForm.credit_id,
        amount_g: sellForm.amount_g,
        price_per_g: sellForm.price_per_g,
      };

      const response = await api.createMarketOffer(offerData);
      
      setResult({
        success: true,
        message: `Offer created successfully for ${sellForm.amount_g}g at $${sellForm.price_per_g}/g`
      });

      // Refresh offers
      const offersRes = await api.listMarketOffers();
      setOffers(offersRes.data.offers || []);

      // Reset form
      setSellForm({ credit_id: '', amount_g: 0, price_per_g: 0.1 });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Failed to create offer'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyOffer = async () => {
    if (!currentAccount) return;

    setProcessing(true);
    try {
      const buyData = {
        buyer_id: currentAccount.id,
        offer_id: buyForm.offer_id,
        amount_g: buyForm.amount_g,
      };

      const response = await api.buyFromMarket(buyData);
      
      setResult({
        success: true,
        message: `Successfully purchased ${buyForm.amount_g}g of credits`
      });

      // Refresh data
      const offersRes = await api.listMarketOffers();
      setOffers(offersRes.data.offers || []);

      // Reset form
      setBuyForm({ offer_id: '', amount_g: 0 });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Failed to buy credits'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetireCredits = async () => {
    if (!currentAccount) return;

    setProcessing(true);
    try {
      // Create canonical payload for signing
      const retirePayload = {
        credit_id: retireForm.credit_id,
        owner_account_id: currentAccount.id,
        amount_g: retireForm.amount_g,
        reason: retireForm.reason,
      };

      const canonical = canonicalJson(retirePayload);
      // Mock signature - in real app, this would be signed by user's private key
      const signature = signMessage(currentAccount.public_key_pem, canonical);

      const retireData = {
        ...retirePayload,
        owner_signature_hex: signature,
      };

      const response = await api.retireCredits(retireData);
      
      setResult({
        success: true,
        message: `Successfully retired ${retireForm.amount_g}g of credits`
      });

      // Reset form
      setRetireForm({ credit_id: '', amount_g: 0, reason: '' });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Failed to retire credits'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-hydrogen-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
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
          <span className="text-gradient">Credit Marketplace</span>
        </h1>
        <p className="text-xl text-gray-400">
          Buy, sell, and retire green hydrogen credits
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
          {[
            { id: 'buy', label: 'Buy Credits', icon: ShoppingCart },
            { id: 'sell', label: 'Sell Credits', icon: DollarSign },
            { id: 'retire', label: 'Retire Credits', icon: Recycle },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'energy' : 'ghost'}
              onClick={() => setActiveTab(id as any)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Offers */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Package className="w-6 h-6 mr-2" />
                  {activeTab === 'buy' ? 'Available Offers' : 'Your Credits'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'buy' 
                    ? 'Credits available for purchase' 
                    : 'Credits you own and can sell or retire'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activeTab === 'buy' ? (
                    offers.filter(offer => offer.status === 'open').map((offer, index) => (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          buyForm.offer_id === offer.id
                            ? 'border-energy-500 bg-energy-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => setBuyForm(prev => ({ ...prev, offer_id: offer.id }))}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-energy-500" />
                            <span className="font-medium text-white">
                              {offer.amount_g.toLocaleString()}g available
                            </span>
                          </div>
                          <Badge variant="verified">
                            ${offer.price_per_g}/g
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          Producer: {offer.producer_id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-gray-400">
                          Total: ${(offer.amount_g * offer.price_per_g).toFixed(2)}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Show user's credits for sell/retire
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Connect your account to view your credits</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  {activeTab === 'buy' && <ShoppingCart className="w-6 h-6 mr-2" />}
                  {activeTab === 'sell' && <DollarSign className="w-6 h-6 mr-2" />}
                  {activeTab === 'retire' && <Recycle className="w-6 h-6 mr-2" />}
                  {activeTab === 'buy' ? 'Buy Credits' : activeTab === 'sell' ? 'Sell Credits' : 'Retire Credits'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'buy' && 'Purchase credits from available offers'}
                  {activeTab === 'sell' && 'List your credits for sale'}
                  {activeTab === 'retire' && 'Permanently retire credits'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'buy' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="buyAmount">Amount (grams)</Label>
                      <Input
                        id="buyAmount"
                        type="number"
                        value={buyForm.amount_g}
                        onChange={(e) => setBuyForm(prev => ({ ...prev, amount_g: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <Button
                      onClick={handleBuyOffer}
                      variant="hydrogen"
                      className="w-full"
                      disabled={!buyForm.offer_id || !buyForm.amount_g || processing}
                    >
                      {processing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      Buy Credits
                    </Button>
                  </>
                )}

                {activeTab === 'sell' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="creditId">Credit ID</Label>
                      <Input
                        id="creditId"
                        value={sellForm.credit_id}
                        onChange={(e) => setSellForm(prev => ({ ...prev, credit_id: e.target.value }))}
                        placeholder="Enter credit ID to sell"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellAmount">Amount (grams)</Label>
                      <Input
                        id="sellAmount"
                        type="number"
                        value={sellForm.amount_g}
                        onChange={(e) => setSellForm(prev => ({ ...prev, amount_g: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerG">Price per gram ($)</Label>
                      <Input
                        id="pricePerG"
                        type="number"
                        step="0.01"
                        value={sellForm.price_per_g}
                        onChange={(e) => setSellForm(prev => ({ ...prev, price_per_g: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <Button
                      onClick={handleCreateOffer}
                      variant="energy"
                      className="w-full"
                      disabled={!sellForm.credit_id || !sellForm.amount_g || processing}
                    >
                      {processing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      List for Sale
                    </Button>
                  </>
                )}

                {activeTab === 'retire' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="retireCreditId">Credit ID</Label>
                      <Input
                        id="retireCreditId"
                        value={retireForm.credit_id}
                        onChange={(e) => setRetireForm(prev => ({ ...prev, credit_id: e.target.value }))}
                        placeholder="Enter credit ID to retire"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retireAmount">Amount (grams)</Label>
                      <Input
                        id="retireAmount"
                        type="number"
                        value={retireForm.amount_g}
                        onChange={(e) => setRetireForm(prev => ({ ...prev, amount_g: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retireReason">Retirement Reason</Label>
                      <Input
                        id="retireReason"
                        value={retireForm.reason}
                        onChange={(e) => setRetireForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g., Green steel production"
                      />
                    </div>
                    <Button
                      onClick={handleRetireCredits}
                      variant="destructive"
                      className="w-full"
                      disabled={!retireForm.credit_id || !retireForm.amount_g || !retireForm.reason || processing}
                    >
                      {processing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Recycle className="w-4 h-4 mr-2" />
                      )}
                      Retire Credits
                    </Button>
                  </>
                )}

                {/* Result Display */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'border-energy-500 bg-energy-500/10' 
                        : 'border-red-500 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-energy-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={result.success ? 'text-energy-400' : 'text-red-400'}>
                        {result.message}
                      </span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Market Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Market Statistics</CardTitle>
            <CardDescription>Current marketplace overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-energy-500 to-energy-600 rounded-full flex items-center justify-center mx-auto mb-3 energy-glow">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {offers.filter(o => o.status === 'open').length}
                </div>
                <div className="text-sm text-gray-400">Active Offers</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-hydrogen-500 to-hydrogen-600 rounded-full flex items-center justify-center mx-auto mb-3 hydrogen-glow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {offers.reduce((sum, offer) => sum + (offer.amount_g || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Credits Listed</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {balances.reduce((sum, balance) => sum + (balance.retired || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Credits Retired</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}