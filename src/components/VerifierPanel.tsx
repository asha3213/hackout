'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Upload,
  Zap,
  Clock,
  Hash,
  Eye
} from 'lucide-react';
import * as api from '../services/api';
import { useApp } from '../contexts/AppContext';

export default function VerifierPanel() {
  const { currentAccount } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.listEvents();
        setEvents(response.data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleMintCredits = async (eventId: string) => {
    setProcessing(true);
    try {
      const result = await api.mintCredits({ event_id: eventId });
      console.log('Credits minted:', result.data);
      
      // Refresh events
      const response = await api.listEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error minting credits:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (event: any) => {
    if (event.verified && event.signature_valid && event.overlap_ok) {
      return <CheckCircle2 className="w-5 h-5 text-energy-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusVariant = (event: any) => {
    if (event.verified && event.signature_valid && event.overlap_ok) {
      return 'verified';
    }
    return 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading verification panel...</p>
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
          <span className="text-gradient">Verifier Panel</span>
        </h1>
        <p className="text-xl text-gray-400">
          Review and verify production events for credit issuance
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
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
                  Production Events
                </CardTitle>
                <CardDescription>Events awaiting verification and credit minting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedEvent?.id === event.id
                          ? 'border-energy-500 bg-energy-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(event)}
                          <span className="font-medium text-white">
                            {event.hydrogen_kg} kg H₂
                          </span>
                        </div>
                        <Badge variant={getStatusVariant(event)}>
                          {event.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-300">Electrolyzer</span>
                          {event.electrolyzer_id}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Energy</span>
                          {event.energy_kwh} kWh
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Start Time</span>
                          {new Date(event.start_time).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Duration</span>
                          {Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60))}h
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${event.signature_valid ? 'bg-energy-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-400">Signature</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${event.overlap_ok ? 'bg-energy-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-400">No Overlap</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Event Details & Actions */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Eye className="w-6 h-6 mr-2" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  {selectedEvent ? 'Review event for verification' : 'Select an event to review'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedEvent ? (
                  <div className="text-center py-12 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select an event to review details</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Event Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        Event Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Event ID:</span>
                          <code className="text-energy-400 text-xs">
                            {selectedEvent.id}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hydrogen:</span>
                          <span className="text-white">{selectedEvent.hydrogen_kg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Energy:</span>
                          <span className="text-white">{selectedEvent.energy_kwh} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Electrolyzer:</span>
                          <span className="text-white">{selectedEvent.electrolyzer_id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Verification Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className={`w-4 h-4 ${selectedEvent.signature_valid ? 'text-energy-500' : 'text-red-500'}`} />
                            <span className="text-sm text-white">Signature Valid</span>
                          </div>
                          <Badge variant={selectedEvent.signature_valid ? 'verified' : 'outline'}>
                            {selectedEvent.signature_valid ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className={`w-4 h-4 ${selectedEvent.overlap_ok ? 'text-energy-500' : 'text-red-500'}`} />
                            <span className="text-sm text-white">No Time Overlap</span>
                          </div>
                          <Badge variant={selectedEvent.overlap_ok ? 'verified' : 'outline'}>
                            {selectedEvent.overlap_ok ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Evidence */}
                    {selectedEvent.evidence_id && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Evidence
                        </h4>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="text-sm text-gray-400">
                            Evidence ID: {selectedEvent.evidence_id}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      {selectedEvent.verified ? (
                        <Button
                          onClick={() => handleMintCredits(selectedEvent.id)}
                          variant="energy"
                          className="w-full"
                          disabled={processing}
                        >
                          {processing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Minting...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Mint Credits
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-400">
                              Event requires verification before minting
                            </span>
                          </div>
                        </div>
                      )}
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