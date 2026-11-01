export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Lead {
  id: string;
  timestamp: string;
  customerName: string;
  phone: string;
  locality: string;
  address?: string;
  spaceImage: string;
  spaceTitle: string;
  waterSource: string;
  waterSourceKannada?: string;
  tdsPpm: number | string;
  membersCount: number | string;
  aiRecommendation: string;
  aiTag: string;
  matchedProductId?: string;
  status: LeadStatus;
  notes: string;
  source: 'Snap & Suggest AI' | 'Live Camera Capture' | 'Web Direct Form' | 'Storefront Walk-in' | 'AI Live Space Analyzer';
}

export type AiImageCategory =
  | 'Water Purifier'
  | 'Kitchen Chimney'
  | 'Water Softener'
  | 'Sand Softener'
  | 'Solar Water Heater'
  | 'Solar Products'
  | 'Other';

export interface AiLibraryImage {
  id: string;
  image_url: string;
  category?: AiImageCategory | string;
  created_at: string;
  notes?: string;
  storage_path?: string;
  is_user_uploaded?: boolean;
  productColor?: string;
  productFinish?: string;
  productType?: string;
  mountingStyle?: string;
  proportions?: string;
}

export interface SpaceAnalysisResult {
  roomType: string;
  dominantWallColor: string;
  wallMaterial: string;
  lightingCondition: string;
  visibleWaterPoints: string;
  visiblePowerPoints: string;
  spaceClearance: string;
  obstacles: string[];
  isClearPhoto: boolean;
  notes?: string;
}

export interface VisualRecommendationMatch {
  image: AiLibraryImage;
  product?: Product;
  productName?: string;
  compatibilityScore: number;
  colorCompatibilityScore?: number;
  installationFeasibilityScore?: number;
  spaceCompatibilityScore?: number;
  suitabilityReason: string;
  colorReason?: string;
  installationNotes?: string;
  concerns?: string;
  category: string;
  needsSpaceConfirmation?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  capacity: string;
  mountType: string;
  tags: string[];
  image: string;
  galleryImages?: string[];
  inStock: boolean;
  visibleOnStorefront: boolean;
  isPublished?: boolean;
  stockQuantity: number;
  featured: boolean;
  description: string;
  features?: string[];
  targetWaterType?: string; // 'Borewell' | 'Municipal' | 'Tanker' | 'All'
  purificationStages?: string; // e.g. '8-Stage RO + UV + UF + Copper + Alkaline'
  warranty?: string; // e.g. '1 Year Comprehensive + Free Installation'
  maxTds?: number | string; // e.g. 'Up to 2000 PPM'
  flowRate?: string; // e.g. '15 LPH Flow'
  storageCapacity?: string; // e.g. '10 Litres'
  createdAt?: string;
  updatedAt?: string;
  is_user_uploaded?: boolean;
  productColor?: string;
  productFinish?: string;
}

export function generateProductSlug(name: string, id?: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (id && !base) return id;
  return base || 'product';
}

export interface Review {
  id: string;
  author: string;
  badge: string;
  rating: number;
  textEn: string;
  textKn: string;
  installedProduct: string;
  locality: string;
  visibleOnWeb: boolean;
}

export interface StoreSettings {
  bannerActive: boolean;
  bannerTextEn: string;
  bannerTextKn: string;
  helplinePhone: string;
  whatsappNumber: string;
  operatingHours: string;
  storefrontAddress: string;
  storefrontTagline: string;
}

export interface ServiceTicket {
  id: string;
  customerName: string;
  phone: string;
  locality: string;
  appliance: string;
  issue: string;
  priority: 'urgent' | 'medium' | 'routine';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  technician: string;
  scheduledDate: string;
  tdsInitial?: number;
  tdsFinal?: number;
  serviceType: 'Installation' | 'Filter Replacement' | 'Motor Repair' | 'AMC Routine';
}

export interface SparePart {
  id: string;
  name: string;
  category: 'Cartridges' | 'Membranes' | 'Pumps & Motors' | 'Tubes & Fittings' | 'Chimney Filters';
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
  reorderStatus: 'optimal' | 'low' | 'critical';
}

// ==============================================================================
// SUPABASE CLIENT ORDERS SYSTEM TYPES
// ==============================================================================
export type OrderType = 'purchase' | 'service' | 'installation' | 'enquiry';
export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'partial';
export type OrderSource = 'website_form' | 'whatsapp' | 'snap_suggest' | 'storefront_walkin' | 'ai_space_analyzer';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  area: string;
  order_type: OrderType;
  notes?: string | null;
  status: OrderStatus;
  total_amount: number;
  payment_status: PaymentStatus;
  source: OrderSource;
  lead_id?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

