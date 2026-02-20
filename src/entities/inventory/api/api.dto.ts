export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  type: 'avatar' | 'badge' | 'skin' | 'effect';
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
}
