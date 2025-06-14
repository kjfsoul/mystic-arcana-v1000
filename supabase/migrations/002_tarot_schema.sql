-- =============================================
-- TAROT ENGINE DATABASE SCHEMA
-- =============================================

-- Create decks table
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    card_number INTEGER,
    suit VARCHAR(50), -- For minor arcana: cups, wands, swords, pentacles
    arcana_type VARCHAR(50) CHECK (arcana_type IN ('major', 'minor')),
    meaning_upright TEXT NOT NULL,
    meaning_reversed TEXT NOT NULL,
    image_url VARCHAR(500),
    keywords JSONB, -- Array of keywords for the card
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_arcana_type ON public.cards(arcana_type);
CREATE INDEX IF NOT EXISTS idx_cards_suit ON public.cards(suit);
CREATE INDEX IF NOT EXISTS idx_decks_active ON public.decks(is_active);

-- Enable Row Level Security
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decks (readable by everyone, only admins can modify)
CREATE POLICY "Decks are viewable by everyone" ON public.decks
    FOR SELECT USING (true);

CREATE POLICY "Only service role can modify decks" ON public.decks
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for cards (readable by everyone, only admins can modify)
CREATE POLICY "Cards are viewable by everyone" ON public.cards
    FOR SELECT USING (true);

CREATE POLICY "Only service role can modify cards" ON public.cards
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default Rider-Waite deck
INSERT INTO public.decks (id, name, description, is_active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Rider-Waite Tarot',
    'The classic and most widely recognized tarot deck, featuring traditional imagery and symbolism.',
    true
) ON CONFLICT (id) DO NOTHING;

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON public.decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();