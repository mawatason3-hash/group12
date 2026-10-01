export type Product = {
  id: string;
  name: string;
  price: number;
  stock: 'In stock' | 'Low';
  unit: string;
};

export const PRODUCTS: Product[] = [
  {id: 'p1', name: 'Avocado', price: 300, stock: 'In stock', unit: 'kg'},
  {id: 'p2', name: 'Beans', price: 1200, stock: 'Low', unit: 'kg'},
  {id: 'p3', name: 'Maize', price: 700, stock: 'In stock', unit: 'kg'},
  {id: 'p4', name: 'Sweet potatoes', price: 500, stock: 'In stock', unit: 'kg'},
  {id: 'p5', name: 'Cassava flour', price: 1500, stock: 'Low', unit: 'kg'},
  {id: 'p6', name: 'Tomatoes', price: 950, stock: 'In stock', unit: 'kg'},
];

export type MarketZone = {
  id: string;
  name: string;
  stallCode: string;
  category: string;
  status: 'Open' | 'Attention' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  summary: string;
  tint: string;
};

export const MARKET_ZONES: MarketZone[] = [
  {
    id: 'kimonyi',
    name: 'Kimonyi Produce Arcade',
    stallCode: 'MSZ-A12',
    category: 'Fresh produce',
    status: 'Open',
    priority: 'High',
    summary: 'Cooking bananas, Irish potatoes and fresh vegetables on the north arcade.',
    tint: '#5C8A4B',
  },
  {
    id: 'muhoza',
    name: 'Muhoza Textile Row',
    stallCode: 'MSZ-B04',
    category: 'Textiles',
    status: 'Open',
    priority: 'Medium',
    summary: 'Kitenge and imishanana cloth bays along the inner corridor.',
    tint: '#B0653F',
  },
  {
    id: 'cyuve',
    name: 'Cyuve Fish and Meat',
    stallCode: 'MSZ-C21',
    category: 'Livestock products',
    status: 'Attention',
    priority: 'High',
    summary: 'Cold trays and smoked fish under the corrugated shed. Wash-down overdue.',
    tint: '#6B7F8C',
  },
  {
    id: 'busogo',
    name: 'Busogo Grain Bays',
    stallCode: 'MSZ-D08',
    category: 'Grains and pulses',
    status: 'Open',
    priority: 'Low',
    summary: 'Maize and bean sacks in numbered bays, dry floor, clear aisles.',
    tint: '#B99A4E',
  },
  {
    id: 'nyakinama',
    name: 'Nyakinama Spice Walk',
    stallCode: 'MSZ-E15',
    category: 'Spices and condiments',
    status: 'Closed',
    priority: 'Medium',
    summary: 'Chili and turmeric bowls. Stall closed pending roof repair.',
    tint: '#A4432F',
  },
  {
    id: 'kinigi',
    name: 'Kinigi Craft Sheds',
    stallCode: 'MSZ-F03',
    category: 'Handicrafts',
    status: 'Open',
    priority: 'Low',
    summary: 'Agaseke baskets and wooden utensils at the Kinigi edge stalls.',
    tint: '#7A5C8A',
  },
];

export type BusRoute = {
  id: string;
  name: string;
  from: string;
  to: string;
  fare: number;
  stops: number;
};

export const ROUTES: BusRoute[] = [
  {id: 'r1', name: 'Route 101', from: 'Nyabugogo', to: 'Remera', fare: 300, stops: 4},
  {id: 'r2', name: 'Route 205', from: 'Nyabugogo', to: 'Kimironko', fare: 350, stops: 6},
  {id: 'r3', name: 'Route 312', from: 'Downtown', to: 'Kicukiro', fare: 300, stops: 5},
  {id: 'r4', name: 'Route 420', from: 'Muhanga', to: 'Kigali', fare: 850, stops: 8},
];
