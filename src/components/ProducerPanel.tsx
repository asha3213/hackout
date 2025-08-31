'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Factory, 
  Upload, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Hash
} from 'lucide-react';
import * as api from '../services/api';
import { generateEd25519KeyPair, signMessage, canonicalJson } from '../services/crypto';
import { useApp } from '../contexts/AppContext';

export default function ProducerPanel() {
  const { currentAccount } = useApp();
  const [sensors, setSensors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [sensorForm, setSensorForm] = useState({
    name: '',
    electrolyzer_id: '',
  });

  const [eventForm, setEventForm] = useState({
    sensor_id: '',
    start_time: '',
    end_time: '',
    energy_kwh: 0,
    hydrogen_kg: 0,
    evidence_file: null as File | null,
  });

  const [step, setStep] = useState<'form' | 'uploading' | 'submitting' | 'complete'>('form');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sensorsRes, eventsRes] = await Promise.all([
          api.listSensors(),
          api.listEvents(),
        ]);
        setSensors(sensorsRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRegisterSensor = async () => {
    if (!currentAccount) return;

    try {
      const keyPair = generateEd25519KeyPair();
      
      const sensorData = {
        name: sensorForm.name,
        electrolyzer_id: sensorForm.electrolyzer_id,
        owner_account_id: currentAccount.id,
        public_key_pem: keyPair.publicKeyPem,
      };

      const response = await api.registerSensor(sensorData);
      
      // Refresh sensors list
      const sensorsRes = await api.listSensors();
      setSensors(sensorsRes.data);
      
      // Reset form
      setSensorForm({ name: '', electrolyzer_id: '' });
    } catch (error) {
      console.error('Error registering sensor:', error);
    }
  };

  const handleSubmitEvent = async () => {
    if (!eventForm.sensor_id) return;

    setSubmitting(true);
    setStep('uploading');

    try {
      let evidenceId = null;

      // Upload evidence if provided
      if (eventForm.evidence_file) {
        const evidenceRes = await api.uploadEvidence(eventForm.evidence_file);
        evidenceId = evidenceRes.data.id;
      }

      setStep('submitting');

      // Find sensor to get its key for signing
      const sensor = sensors.find(s => s.id === eventForm.sensor_id);
      if (!sensor) throw new Error('Sensor not found');

      // Create canonical payload for signing
      const eventPayload = {
        sensor_id: eventForm.sensor_id,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        energy_kwh: eventForm.energy_kwh,
        hydrogen_kg: eventForm.hydrogen_kg,
        evidence_id: evidenceId,
      };

      const canonical = canonicalJson(eventPayload);
      
      // For demo, we'll use a mock signature
      // In real implementation, this would be signed by the sensor's private key
      const mockSignature = signMessage(sensor.public_key_pem, canonical);

      const eventData = {
        ...eventPayload,
        sensor_signature_hex: mockSignature,
      };

      const response = await api.submitEvent(eventData);
      setResult(response.data);
      setStep('complete');

      // Refresh events
      const eventsRes = await api.listEvents();
      setEvents(eventsRes.data);

    } catch (error) {
      console.error('Error submitting event:', error);
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setEventForm({
      sensor_id: '',
      start_time: '',
      end_time: '',
      energy_kwh: 0,
      hydrogen_kg: 0,
      evidence_file: null,
    });
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading producer panel...</p>
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
          <span className="text-gradient">Producer Panel</span>
        </h1>
        <p className="text-xl text-gray-400">
          Register sensors and submit production events
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sensor Registration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="energy-glow">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Factory className="w-6 h-6 mr-2" />
                Register Sensor
              </CardTitle>
              <CardDescription>Add a new production sensor to your facility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sensorName">Sensor Name</Label>
                <Input
                  id="sensorName"
                  value={sensorForm.name}
                  onChange={(e) => setSensorForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., StackMeter-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electrolyzerId">Electrolyzer ID</Label>
                <Input
                  id="electrolyzerId"
                  value={sensorForm.electrolyzer_id}
                  onChange={(e) => setSensorForm(prev => ({ ...prev, electrolyzer_id: e.target.value }))}
                  placeholder="e.g., ELX-001"
                />
              </div>
              <Button
                onClick={handleRegisterSensor}
                variant="energy"
                className="w-full"
                disabled={!sensorForm.name || !sensorForm.electrolyzer_id}
              >
                <Factory className="w-4 h-4 mr-2" />
                Register Sensor
              </Button>
            </CardContent>
          </Card>

          {/* Registered Sensors */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-white">Your Sensors</CardTitle>
              <CardDescription>Registered sensors for this account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sensors
                  .filter(sensor => sensor.owner_account_id === currentAccount?.id)
                  .map((sensor, index) => (
                    <motion.div
                      key={sensor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{sensor.name}</span>
                        <Badge variant="verified">Active</Badge>
                      </div>
                      <div className="text-sm text-gray-400">
                        ELX: {sensor.electrolyzer_id}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Submission */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="hydrogen-glow">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="w-6 h-6 mr-2" />
                Submit Production Event
              </CardTitle>
              <CardDescription>Record a hydrogen production event</CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'form' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="sensorSelect">Sensor</Label>
                    <select
                      id="sensorSelect"
                      value={eventForm.sensor_id}
                      onChange={(e) => setEventForm(prev => ({ ...prev, sensor_id: e.target.value }))}
                      className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="">Select a sensor</option>
                      {sensors
                        .filter(sensor => sensor.owner_account_id === currentAccount?.id)
                        .map(sensor => (
                          <option key={sensor.id} value={sensor.id}>
                            {sensor.name} ({sensor.electrolyzer_id})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={eventForm.start_time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={eventForm.end_time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="energyKwh">Energy (kWh)</Label>
                      <Input
                        id="energyKwh"
                        type="number"
                        step="0.1"
                        value={eventForm.energy_kwh}
                        onChange={(e) => setEventForm(prev => ({ ...prev, energy_kwh: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hydrogenKg">Hydrogen (kg)</Label>
                      <Input
                        id="hydrogenKg"
                        type="number"
                        step="0.1"
                        value={eventForm.hydrogen_kg}
                        onChange={(e) => setEventForm(prev => ({ ...prev, hydrogen_kg: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Evidence File (Optional)</Label>
                    <div 
                      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-energy-500 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-400">
                        {eventForm.evidence_file ? eventForm.evidence_file.name : 'Upload evidence file'}
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEventForm(prev => ({ ...prev, evidence_file: e.target.files![0] }));
                          }
                        }}
                        className="hidden"
                        accept=".csv,.txt,.json"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitEvent}
                    variant="energy"
                    className="w-full"
                    disabled={!eventForm.sensor_id || !eventForm.start_time || !eventForm.end_time}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Submit Production Event
                  </Button>
                </motion.div>
              )}

              {step === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 border-4 border-energy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uploading Evidence</h3>
                  <p className="text-gray-400">Storing evidence file...</p>
                </motion.div>
              )}

              {step === 'submitting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 border-4 border-hydrogen-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Submitting Event</h3>
                  <p className="text-gray-400">Verifying signatures and timestamps...</p>
                </motion.div>
              )}

              {step === 'complete' && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="w-16 h-16 text-energy-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Event Submitted!</h3>
                  <p className="text-gray-400 mb-6">
                    {result.verified ? 'Event verified and ready for minting' : 'Event submitted for verification'}
                  </p>
                  
                  <div className="space-y-2 text-left max-w-md mx-auto mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event ID:</span>
                      <code className="text-energy-400 text-sm">{result.id}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hydrogen:</span>
                      <span className="text-white">{result.hydrogen_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verified:</span>
                      <Badge variant={result.verified ? 'verified' : 'pending'}>
                        {result.verified ? 'Yes' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={resetForm}
                    variant="energy"
                  >
                    Submit Another Event
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Your Production Events</CardTitle>
            <CardDescription>Events submitted by your sensors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter(event => sensors.some(sensor => sensor.id === event.sensor_id && sensor.owner_account_id === currentAccount?.id))
                .slice(0, 5)
                .map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
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
                        {event.electrolyzer_id} • {event.energy_kwh} kWh • 
                        {new Date(event.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.verified && (
                        <CheckCircle2 className="w-5 h-5 text-energy-500" />
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