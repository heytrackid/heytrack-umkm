-- Create hpp_recommendations table
CREATE TABLE IF NOT EXISTS hpp_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    potential_savings DECIMAL(10,2) DEFAULT 0,
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    is_implemented BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hpp_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hpp recommendations" ON hpp_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hpp recommendations" ON hpp_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hpp recommendations" ON hpp_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hpp recommendations" ON hpp_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_hpp_recommendations_recipe_id ON hpp_recommendations(recipe_id);
CREATE INDEX idx_hpp_recommendations_user_id ON hpp_recommendations(user_id);
CREATE INDEX idx_hpp_recommendations_type ON hpp_recommendations(recommendation_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hpp_recommendations_updated_at
    BEFORE UPDATE ON hpp_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();