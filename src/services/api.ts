import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api/v1';
const API_V2_BASE = 'http://127.0.0.1:5000/api/v2';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

const apiV2 = axios.create({
  baseURL: API_V2_BASE,
  timeout: 30000,
});

// Health
export const healthCheck = () => api.get('/health');

// Accounts
export const createAccount = (data: {
  name: string;
  role: string;
  public_key_pem: string;
}) => api.post('/accounts', data);

export const listAccounts = () => api.get('/accounts');

export const getAccountBalance = (accountId: string) => 
  api.get(`/accounts/${accountId}/balance`);

// Sensors
export const registerSensor = (data: {
  name: string;
  electrolyzer_id: string;
  owner_account_id: string;
  public_key_pem: string;
}) => api.post('/sensors', data);

export const listSensors = () => api.get('/sensors');

// Evidence
export const uploadEvidence = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/evidence/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Events
export const submitEvent = (data: {
  sensor_id: string;
  start_time: string;
  end_time: string;
  energy_kwh: number;
  hydrogen_kg: number;
  evidence_id?: string;
  sensor_signature_hex: string;
}) => api.post('/events', data);

export const listEvents = () => api.get('/events');

// Credits
export const mintCredits = (data: { event_id: string }) => 
  api.post('/credits/mint', data);

export const transferCredits = (data: {
  credit_id: string;
  from_account_id: string;
  to_account_id: string;
  amount_g: number;
  owner_signature_hex: string;
}) => api.post('/credits/transfer', data);

export const retireCredits = (data: {
  credit_id: string;
  owner_account_id: string;
  amount_g: number;
  reason: string;
  owner_signature_hex: string;
}) => api.post('/credits/retire', data);

// Blocks
export const closeBlock = (data?: { note?: string }) => 
  api.post('/blocks/close', data);

export const getLatestBlock = () => api.get('/blocks/latest');

export const getBlock = (blockId: string) => api.get(`/blocks/${blockId}`);

export const getBlockTxs = (blockId: string) => api.get(`/blocks/${blockId}/txs`);

export const getTxProof = (txHash: string) => api.get(`/proof/tx/${txHash}`);

// State (Phase 2)
export const getStateRoot = () => apiV2.get('/state/root');

export const getStateProof = (accountId: string) => 
  apiV2.get(`/state/proof/${accountId}`);

export const getStateProofCompressed = (accountId: string) => 
  apiV2.get(`/state/proof/${accountId}/compressed`);

export const anchorState = () => apiV2.post('/state/anchor', {});

// Market (Phase 3)
export const createMarketOffer = (data: {
  producer_id: string;
  credit_id: string;
  amount_g: number;
  price_per_g: number;
}) => api.post('/market/offers', data);

export const listMarketOffers = (params?: {
  producer_id?: string;
  credit_id?: string;
}) => api.get('/market/offers', { params });

export const getMarketOffer = (offerId: string) => 
  api.get(`/market/offers/${offerId}`);

export const buyFromMarket = (data: {
  buyer_id: string;
  offer_id: string;
  amount_g: number;
}) => api.post('/market/buy', data);

// Reports
export const getRetirementsReport = () => api.get('/reports/retirements');

export default api;