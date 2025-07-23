-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  product_data JSONB,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't have duplicate items in their wishlist
  UNIQUE(user_id, product_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_added_at ON wishlist_items(added_at);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_key ON wishlist_items(product_key);

-- Enable Row Level Security (RLS)
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items
CREATE POLICY "Users can update their own wishlist items" ON wishlist_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE wishlist_items IS 'Stores user wishlist items for the Mystic Marketplace';
COMMENT ON COLUMN wishlist_items.product_key IS 'Reference to the product in MYSTIC_PRODUCTS';
COMMENT ON COLUMN wishlist_items.product_data IS 'Cached product data for performance and historical reference';