/**
 * PulseTips — 70/30 escrow tipping contract. Mirrors the server-side ABI.
 * 70% of every tip goes to the post creator, 30% accrues to earlier
 * supporters who can withdraw it with {claim}.
 */
export const PULSE_TIPS_ABI = [
  {
    type: 'function',
    name: 'tip',
    stateMutability: 'payable',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'creator', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'pending',
    stateMutability: 'view',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'backer', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'sharesOf',
    stateMutability: 'view',
    inputs: [
      { name: 'postId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getPool',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'creator', type: 'address' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'totalTipped', type: 'uint256' },
          { name: 'accRewardPerShare', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'creatorOf',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'event',
    name: 'Tipped',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'backer', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'creatorCut', type: 'uint256', indexed: false },
      { name: 'backerCut', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Claimed',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'backer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CreatorRegistered',
    inputs: [
      { name: 'postId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
    ],
  },
] as const;

/**
 * PostRegistry — on-chain anchoring of posts. Mirrors the server-side ABI.
 * Each post is keyed by the bytes32 keccak of its application-side id.
 */
export const POST_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerPost',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'postId', type: 'bytes32' },
      { name: 'metadataUri', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isRegistered',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'creatorOf',
    stateMutability: 'view',
    inputs: [{ name: 'postId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'event',
    name: 'PostRegistered',
    inputs: [
      { name: 'postId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'metadataUri', type: 'string', indexed: false },
    ],
  },
] as const;