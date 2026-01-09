const bcrypt = require('bcryptjs');

const DIVISIONS = [
  { id: 'creative', name: 'Creative' },
  { id: 'operations', name: 'Operations' },
  { id: 'wayfarer', name: 'Interactive' }
];

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

const OMNIVAEL_ASSETS = [
  {
    assetId: 'OM-BK-001',
    creatorId: '1', // Admin/Sara
    divisionId: 'creative',
    ipStatus: 'Siron_Royalty_18',
    legalSignatureStatus: '2026-01-02T10:00:00Z',
    status: 'SIGNED',
    contentMetadata: {
      title: 'The Chronicles of Omnivael',
      genre: 'Epic Fantasy',
      type: 'Book'
    },
    financialTag: {
      shardPrice: 15,
      releaseDate: '2026-02-01'
    }
  },
  {
    assetId: 'OM-3D-002',
    creatorId: '4', // Wayfarer/Artist
    divisionId: 'wayfarer',
    ipStatus: 'Work_for_Hire',
    legalSignatureStatus: 'NULL',
    status: 'DRAFT',
    contentMetadata: {
      title: 'Vrog Warrior Mesh',
      genre: 'Sci-Fi',
      type: '3D_Model'
    },
    financialTag: {
      shardPrice: 50,
      releaseDate: '2026-03-01'
    }
  },
  {
    assetId: 'OM-CM-003',
    creatorId: '2', // Creative
    divisionId: 'creative',
    ipStatus: 'Work_for_Hire',
    legalSignatureStatus: 'NULL',
    status: 'DRAFT',
    contentMetadata: {
      title: 'Neon Shadows',
      genre: 'Cyberpunk',
      type: 'Comic',
      chapter: 'Issue #1',
      pages: [
        'https://placehold.co/600x900/1a1a1a/cyan?text=Cover',
        'https://placehold.co/600x900/1a1a1a/cyan?text=Page+1',
        'https://placehold.co/600x900/1a1a1a/cyan?text=Page+2',
        'https://placehold.co/600x900/1a1a1a/cyan?text=Page+3'
      ]
    },
    financialTag: {
      shardPrice: 5,
      releaseDate: '2026-04-01'
    }
  }
];

const USERS = [
  { 
    id: '1', 
    username: 'admin', 
    email: 'admin@elderworlds.com',
    fullName: 'Sara Siron',
    position: 'CEO',
    department: 'Executive',
    status: 'active',
    passwordHash: hash('admin123'), 
    role: 'admin', 
    divisionId: null, 
    mfaEnabled: true,
    contactDetails: { phone: '+1-555-0100', location: 'HQ' }
  },
  { 
    id: '2', 
    username: 'creative', 
    email: 'creative@elderworlds.com',
    fullName: 'Creative Lead',
    position: 'Director',
    department: 'Creative',
    status: 'active',
    passwordHash: hash('creative123'), 
    role: 'division', 
    divisionId: 'creative', 
    mfaEnabled: false,
    contactDetails: { phone: '+1-555-0101', location: 'Remote' }
  },
  { 
    id: '3', 
    username: 'ops', 
    email: 'ops@elderworlds.com',
    fullName: 'Operations Manager',
    position: 'Manager',
    department: 'Operations',
    status: 'active',
    passwordHash: hash('ops123'), 
    role: 'division', 
    divisionId: 'operations', 
    mfaEnabled: false,
    contactDetails: { phone: '+1-555-0102', location: 'HQ' }
  },
  { 
    id: '4', 
    username: 'interactive', 
    email: 'interactive@elderworlds.com',
    fullName: 'Tech Lead',
    position: 'Lead Developer',
    department: 'Interactive',
    status: 'active',
    passwordHash: hash('interactive123'), 
    role: 'division', 
    divisionId: 'interactive', 
    mfaEnabled: false,
    contactDetails: { phone: '+1-555-0103', location: 'Remote' }
  },
  // Slot 1: Nexus Player Example
  { 
    id: '5', 
    username: 'player1', 
    email: 'player1@example.com',
    fullName: 'Player One',
    position: 'Player',
    department: 'Community',
    status: 'active',
    passwordHash: hash('player123'), 
    role: 'user', 
    divisionId: null,
    nexus_level: 5,
    nexus_xp: 2500,
    shard_balance: 100,
    is_elite: true,
    mfaEnabled: false
  }
];

const SHAREHOLDERS = [
  {
    id: '1',
    name: 'Sara Siron',
    type: 'Founder',
    shares: 9000000,
    percentage: 90.0,
    email: 'admin@elderworlds.com'
  }
];

const AUDIT_LOGS = [
  {
    id: 'log-1',
    action: 'SYSTEM_INIT',
    targetUserId: 'system',
    performedBy: 'system',
    timestamp: new Date().toISOString(),
    details: 'System initialized'
  }
];


const INITIAL_ASSETS_VALUE = 4250000;

const INITIAL_ROYALTY_STREAMS = [
  { id: '1', name: 'Chapter 1 Sales', value: 1200, category: 'Book Sales' },
  { id: '2', name: 'Character Mesh License', value: 5000, category: '3D Assets' },
];

const INITIAL_RECEIPTS = [
  { id: '1', date: '2026-01-02', asset: 'Chapter 1 Manuscript', signer: 'Sara Siron', amount: 500 },
];

const INITIAL_CONTRACTS = [
  { id: '1', assetId: 'asset-001', signer: 'Sara Siron', date: '2026-01-02' },
];

const INITIAL_BUDGET_ITEMS = [
  { id: '1', category: 'Operations', name: 'AT&T Company Phone', allocated: 120.00, actual: 112.00, startDate: '2026-01-01', endDate: '2026-12-31', frequency: 'Monthly' },
  { id: '2', category: 'Software', name: 'Quickbooks', allocated: 40.00, actual: 39.00, startDate: '2026-01-01', endDate: '2026-12-31', frequency: 'Monthly' },
];

const CAP_TABLE = {
  founders: 9000000,
  pool: 1000000,
  poolUtilized: 150000,
};

const KPI_DATA = {
  portfolioSize: 142,
  headcount: 12,
  runwayDays: 24, // Days until Feb 1st Launch
};

const WAYFARER_ASSETS = [
  { id: '1', name: 'Vrog_Warrior_Mesh.fbx', type: 'Character / High Poly', value: 8000, status: 'pending' },
  { id: '2', name: 'Cyber_City_Env.unitypackage', type: 'Environment / Level 1', value: 12500, status: 'signed' },
  { id: '3', name: 'Plasma_Rifle_v2.fbx', type: 'Weapon / Prop', value: 3200, status: 'pending' }
];

const WAYFARER_VAULT_ASSETS = [
    { id: 1, name: 'Hero_Knight_Base.fbx', type: 'Character', polys: 12500, status: 'optimized', updated: '2 days ago', author: 'Sarah K.' },
    { id: 2, name: 'Ancient_Tree_01.glb', type: 'Environment', polys: 45000, status: 'heavy', updated: '4 hours ago', author: 'Mike R.' },
    { id: 3, name: 'Stone_Wall_Module.fbx', type: 'Prop', polys: 850, status: 'optimized', updated: '1 week ago', author: 'Sarah K.' },
    { id: 4, name: 'Dragon_Boss_v2.fbx', type: 'Character', polys: 85000, status: 'heavy', updated: 'Yesterday', author: 'Alex T.' },
    { id: 5, name: 'Potion_Health.glb', type: 'Item', polys: 420, status: 'optimized', updated: '3 days ago', author: 'Mike R.' },
    { id: 6, name: 'Terrain_Chunk_A4.fbx', type: 'Environment', polys: 15000, status: 'optimized', updated: '5 hours ago', author: 'Sarah K.' },
];

const WAYFARER_PROJECTS = [
  {
    id: 'p1',
    name: 'Chronicles of Aethelgard',
    description: 'Open-world fantasy RPG set in a fragmented world.',
    zones: [
      { id: 1, name: 'Forest_Outskirts', status: 'live', x: 20, y: 30 },
      { id: 2, name: 'Iron_Keep_Ruins', status: 'progress', x: 50, y: 40 },
      { id: 3, name: 'Crystal_Cave', status: 'draft', x: 80, y: 60 },
      { id: 4, name: 'Village_Center', status: 'live', x: 35, y: 20 },
    ],
    requests: [
      { id: 1, title: 'Broken Stone Arch', desc: 'Need a variation of the main arch for the forest entrance.', priority: 'high' },
      { id: 2, title: 'Shopkeeper Counter', desc: 'Wooden counter with space for items.', priority: 'medium' },
      { id: 3, title: 'Crystal Shards', desc: 'Glowing blue crystals for the cave lighting.', priority: 'low' },
    ]
  },
  {
    id: 'p2',
    name: 'Neon Horizon',
    description: 'Cyberpunk tactical shooter in a mega-city.',
    zones: [
      { id: 101, name: 'Cyber_Slums', status: 'live', x: 15, y: 25 },
      { id: 102, name: 'Corporate_Plaza', status: 'progress', x: 45, y: 35 },
      { id: 103, name: 'Wasteland_Highway', status: 'draft', x: 75, y: 70 },
      { id: 104, name: 'Industrial_Sector', status: 'progress', x: 60, y: 20 },
    ],
    requests: [
      { id: 101, title: 'Holographic Billboard', desc: 'Animated ad for "SodaPop" with glitch effects.', priority: 'medium' },
      { id: 102, title: 'Flying Car Model', desc: 'Low-poly background vehicle for traffic streams.', priority: 'low' },
      { id: 103, title: 'Plasma Rifle', desc: 'Hero asset for the main character weapon.', priority: 'high' },
    ]
  },
  {
    id: 'p3',
    name: 'Project: Echo',
    description: 'Survival horror game in an abandoned space station.',
    zones: [
      { id: 201, name: 'Crew_Quarters', status: 'live', x: 30, y: 50 },
      { id: 202, name: 'Reactor_Core', status: 'draft', x: 60, y: 60 },
      { id: 203, name: 'Bridge', status: 'progress', x: 50, y: 20 },
    ],
    requests: [
      { id: 201, title: 'Flickering Light Fixture', desc: 'Wall-mounted light with spark particles.', priority: 'medium' },
      { id: 202, title: 'Blood Decals', desc: 'Various splatter patterns for floors and walls.', priority: 'high' },
    ]
  }
];

const OMNIVAEL_LIBRARY = [
  {
    id: 'bk-001',
    title: 'The Chronicles of Omnivael',
    author: 'Sara Siron',
    type: 'Book',
    cover: 'https://placehold.co/200x300/1a1a1a/gold?text=Chronicles',
    description: 'The definitive history of the realm, from the First Spark to the Age of Silence.',
    price: 15.00
  },
  {
    id: 'cm-001',
    title: 'Wayfarer: Origins',
    author: 'Nexus Team',
    type: 'Comic',
    cover: 'https://placehold.co/200x300/1a1a1a/cyan?text=Origins',
    description: 'Follow the first Wayfarer as they discover the breach in the sky.',
    price: 4.99
  },
  {
    id: 'st-001',
    title: 'The Merchant of Svit',
    author: 'J. Doe',
    type: 'Story',
    cover: 'https://placehold.co/200x300/1a1a1a/orange?text=Merchant',
    description: 'A short story about greed, trade, and the hidden cost of magic.',
    price: 0.99
  },
  {
    id: 'bk-002',
    title: 'Codex of Laws',
    author: 'The High Council',
    type: 'Book',
    cover: 'https://placehold.co/200x300/2a1a1a/red?text=Laws',
    description: 'Understanding the legal framework that binds the Five Kingdoms.',
    price: 12.50
  },
  {
    id: 'cm-002',
    title: 'Shadows of the Void',
    author: 'Darkstar',
    type: 'Comic',
    cover: 'https://placehold.co/200x300/000000/purple?text=Void',
    description: 'A graphic novel exploring the darker side of space exploration.',
    price: 5.99
  }
];

module.exports = {
  DIVISIONS,
  OMNIVAEL_ASSETS,
  USERS,
  INITIAL_ASSETS_VALUE,
  INITIAL_ROYALTY_STREAMS,
  INITIAL_RECEIPTS,
  INITIAL_CONTRACTS,
  INITIAL_BUDGET_ITEMS,
  CAP_TABLE,
  KPI_DATA,
  WAYFARER_ASSETS,
  WAYFARER_VAULT_ASSETS,
  WAYFARER_PROJECTS,
  OMNIVAEL_LIBRARY,
  AUDIT_LOGS,
  SHAREHOLDERS
};
