'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Search, 
  ExternalLink, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Hash
} from 'lucide-react';
import { blockchain } from '../lib/blockchain';
import { verifierApi } from '../lib/verifierApi';
import { HydrogenBatch } from '../lib/mockData';
import { formatAddress, formatDate } from '../lib/utils';

export default function AuditorPanel() {
  const [batches, setBatches] = useState<HydrogenBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<HydrogenBatch | null>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await blockchain.getBatches();
        setBatches(data);
      } catch (error) {
        console.error('Error loading batches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  const filteredBatches = batches.filter(batch =>
    batch.batchHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.producer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewEvidence = async (batch: HydrogenBatch) => {
    setSelectedBatch(batch);
    setLoadingEvidence(true);
    
    try {
      const evidenceData = await verifierApi.getBatchEvidence(batch.batchHash);
      setEvidence(evidenceData);
    } catch (error) {
      console.error('Error loading evidence:', error);
      setEvidence(null);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'issued':
        return <CheckCircle2 className="w-5 h-5 text-energy-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'retired':
        return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

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
          <p className="text-gray-400">Loading audit data...</p>
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
          <span className="text-gradient">Audit & Verification</span>
        </h1>
        <p className="text-xl text-gray-400">
          Review and verify green hydrogen production batches
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Batch List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Shield className="w-6 h-6 mr-2" />
                  Production Batches
                </CardTitle>
                <CardDescription>All registered hydrogen production batches</CardDescription>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by batch hash or producer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredBatches.map((batch, index) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedBatch?.id === batch.id
                          ? 'border-energy-500 bg-energy-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handleViewEvidence(batch)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(batch.status)}
                          <code className="text-sm font-mono text-energy-400">
                            {batch.batchHash}
                          </code>
                        </div>
                        <Badge variant={getStatusVariant(batch.status)}>
                          {batch.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-300">Producer</span>
                          {formatAddress(batch.producer)}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Quantity</span>
                          {batch.quantity.toLocaleString()} grams
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Certifier</span>
                          {formatAddress(batch.certifier)}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Created</span>
                          {formatDate(batch.createdAt)}
                        </div>
                      </div>
                      
                      {batch.status === 'retired' && batch.retiredAt && (
                        <div className="mt-3 p-2 bg-gray-500/10 rounded border border-gray-500/20">
                          <div className="text-xs text-gray-400">
                            <strong>Retired:</strong> {formatDate(batch.retiredAt)} by {formatAddress(batch.retiredBy!)}
                          </div>
                          {batch.retirementNote && (
                            <div className="text-xs text-gray-400 mt-1">
                              <strong>Note:</strong> {batch.retirementNote}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Evidence Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText className="w-6 h-6 mr-2" />
                  Evidence Review
                </CardTitle>
                <CardDescription>
                  {selectedBatch ? 'Review supporting documentation' : 'Select a batch to view evidence'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedBatch ? (
                  <div className="text-center py-12 text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a batch to review its evidence</p>
                  </div>
                ) : loadingEvidence ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading evidence...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Batch Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        Batch Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hash:</span>
                          <code className="text-energy-400 text-xs">
                            {selectedBatch.batchHash}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">CID:</span>
                          <code className="text-hydrogen-400 text-xs">
                            {selectedBatch.cid}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quantity:</span>
                          <span className="text-white">{selectedBatch.quantity.toLocaleString()} g</span>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Documents */}
                    {evidence && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Evidence Documents
                        </h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Lab Certificate
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            REC Certificate
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Verification Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-energy-500/10 border border-energy-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-energy-500" />
                            <span className="text-sm text-white">Schema Valid</span>
                          </div>
                          <Badge variant="verified">✓</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-energy-500/10 border border-energy-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-energy-500" />
                            <span className="text-sm text-white">Signatures Valid</span>
                          </div>
                          <Badge variant="verified">✓</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-energy-500/10 border border-energy-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-energy-500" />
                            <span className="text-sm text-white">No Overlaps</span>
                          </div>
                          <Badge variant="verified">✓</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <Button
                        variant="energy"
                        size="sm"
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on IPFS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}