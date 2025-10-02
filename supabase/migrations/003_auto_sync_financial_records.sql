-- Migration: Auto-sync Financial Records from Stock Transactions
-- Purpose: Automatically create financial records when stock transactions occur
-- This ensures proper cashflow tracking for UMKM bakeries

-- Function to auto-create financial records from stock transactions
CREATE OR REPLACE FUNCTION sync_stock_transaction_to_financial_records()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    financial_category VARCHAR(255);
    financial_description TEXT;
    financial_amount NUMERIC(12,2);
BEGIN
    -- Only process PURCHASE transactions (expenses)
    -- USAGE/WASTE are already tracked through order completion workflow
    IF NEW.type = 'PURCHASE' THEN
        -- Set category based on transaction context
        financial_category := COALESCE(NEW.category, 'Pembelian Bahan Baku');
        
        -- Build description
        financial_description := COALESCE(
            NEW.notes,
            'Pembelian ' || COALESCE(NEW.ingredient_name, 'bahan baku') || 
            ' - Qty: ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'unit')
        );
        
        -- Calculate amount (positive for expenses)
        financial_amount := ABS(COALESCE(NEW.total_price, NEW.quantity * COALESCE(NEW.unit_price, 0)));
        
        -- Insert financial record
        INSERT INTO financial_records (
            type,
            category,
            amount,
            description,
            reference,
            date,
            metadata
        ) VALUES (
            'EXPENSE',
            financial_category,
            financial_amount,
            financial_description,
            COALESCE(NEW.reference, 'ST-' || NEW.id::text),
            COALESCE(NEW.date, NOW()::date),
            jsonb_build_object(
                'source', 'stock_transaction',
                'transaction_id', NEW.id,
                'ingredient_id', NEW.ingredient_id,
                'ingredient_name', NEW.ingredient_name,
                'quantity', NEW.quantity,
                'unit', NEW.unit,
                'unit_price', NEW.unit_price,
                'supplier', NEW.supplier,
                'auto_synced', true,
                'sync_timestamp', NOW()
            )
        );
        
        -- Log the sync
        RAISE NOTICE 'Auto-synced stock transaction % to financial records (amount: %)', NEW.id, financial_amount;
        
    -- Handle ADJUSTMENT transactions if they represent purchases/expenses
    ELSIF NEW.type = 'ADJUSTMENT' AND NEW.quantity > 0 AND NEW.unit_price IS NOT NULL THEN
        financial_category := 'Penyesuaian Stock';
        financial_description := COALESCE(
            NEW.notes,
            'Penyesuaian stock ' || COALESCE(NEW.ingredient_name, 'bahan baku') ||
            ' - Qty: +' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'unit')
        );
        financial_amount := NEW.quantity * COALESCE(NEW.unit_price, 0);
        
        -- Only create financial record if there's a cost involved
        IF financial_amount > 0 THEN
            INSERT INTO financial_records (
                type,
                category,
                amount,
                description,
                reference,
                date,
                metadata
            ) VALUES (
                'EXPENSE',
                financial_category,
                financial_amount,
                financial_description,
                COALESCE(NEW.reference, 'ADJ-' || NEW.id::text),
                COALESCE(NEW.date, NOW()::date),
                jsonb_build_object(
                    'source', 'stock_adjustment',
                    'transaction_id', NEW.id,
                    'ingredient_id', NEW.ingredient_id,
                    'ingredient_name', NEW.ingredient_name,
                    'quantity', NEW.quantity,
                    'unit', NEW.unit,
                    'unit_price', NEW.unit_price,
                    'auto_synced', true,
                    'sync_timestamp', NOW()
                )
            );
            
            RAISE NOTICE 'Auto-synced stock adjustment % to financial records (amount: %)', NEW.id, financial_amount;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for stock transactions
DROP TRIGGER IF EXISTS auto_sync_stock_to_financial ON stock_transactions;
CREATE TRIGGER auto_sync_stock_to_financial
    AFTER INSERT ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION sync_stock_transaction_to_financial_records();

-- Function to auto-create financial records from operational costs
CREATE OR REPLACE FUNCTION sync_operational_cost_to_financial_records()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    financial_description TEXT;
BEGIN
    -- Build description
    financial_description := 'Biaya Operasional: ' || NEW.name;
    
    IF NEW.notes IS NOT NULL AND NEW.notes != '' THEN
        financial_description := financial_description || ' - ' || NEW.notes;
    END IF;
    
    -- Insert financial record
    INSERT INTO financial_records (
        type,
        category,
        amount,
        description,
        reference,
        date,
        metadata
    ) VALUES (
        'EXPENSE',
        'Biaya Operasional',
        NEW.amount,
        financial_description,
        COALESCE(NEW.reference, 'OP-' || NEW.id::text),
        COALESCE(NEW.date, NOW()::date),
        jsonb_build_object(
            'source', 'operational_cost',
            'cost_id', NEW.id,
            'cost_name', NEW.name,
            'cost_type', NEW.type,
            'frequency', NEW.frequency,
            'auto_synced', true,
            'sync_timestamp', NOW()
        )
    );
    
    RAISE NOTICE 'Auto-synced operational cost % to financial records (amount: %)', NEW.id, NEW.amount;
    
    RETURN NEW;
END;
$$;

-- Create trigger for operational costs (if table exists)
-- Note: This will only work if operational_costs table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operational_costs') THEN
        DROP TRIGGER IF EXISTS auto_sync_operational_to_financial ON operational_costs;
        CREATE TRIGGER auto_sync_operational_to_financial
            AFTER INSERT ON operational_costs
            FOR EACH ROW
            EXECUTE FUNCTION sync_operational_cost_to_financial_records();
    END IF;
END;
$$;

-- Function to handle updates to operational costs
CREATE OR REPLACE FUNCTION sync_operational_cost_update_to_financial_records()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    financial_description TEXT;
    amount_diff NUMERIC(12,2);
BEGIN
    -- Only process if amount changed
    IF OLD.amount IS DISTINCT FROM NEW.amount THEN
        amount_diff := NEW.amount - OLD.amount;
        
        -- Build description
        financial_description := 'Update Biaya Operasional: ' || NEW.name || 
                               ' (Perubahan: ' || 
                               CASE 
                                   WHEN amount_diff > 0 THEN '+Rp ' || amount_diff::text
                                   ELSE 'Rp ' || amount_diff::text
                               END || ')';
        
        IF NEW.notes IS NOT NULL AND NEW.notes != '' THEN
            financial_description := financial_description || ' - ' || NEW.notes;
        END IF;
        
        -- Insert financial record for the difference
        IF amount_diff != 0 THEN
            INSERT INTO financial_records (
                type,
                category,
                amount,
                description,
                reference,
                date,
                metadata
            ) VALUES (
                'EXPENSE',
                'Penyesuaian Biaya Operasional',
                ABS(amount_diff),
                financial_description,
                COALESCE(NEW.reference, 'OP-UPD-' || NEW.id::text),
                NOW()::date,
                jsonb_build_object(
                    'source', 'operational_cost_update',
                    'cost_id', NEW.id,
                    'cost_name', NEW.name,
                    'old_amount', OLD.amount,
                    'new_amount', NEW.amount,
                    'amount_diff', amount_diff,
                    'auto_synced', true,
                    'sync_timestamp', NOW()
                )
            );
            
            RAISE NOTICE 'Auto-synced operational cost update % to financial records (diff: %)', NEW.id, amount_diff;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create update trigger for operational costs (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operational_costs') THEN
        DROP TRIGGER IF EXISTS auto_sync_operational_update_to_financial ON operational_costs;
        CREATE TRIGGER auto_sync_operational_update_to_financial
            AFTER UPDATE ON operational_costs
            FOR EACH ROW
            EXECUTE FUNCTION sync_operational_cost_update_to_financial_records();
    END IF;
END;
$$;

-- Add helpful indexes for financial records if they don't exist
CREATE INDEX IF NOT EXISTS idx_financial_records_source 
    ON financial_records USING gin (metadata) 
    WHERE metadata ? 'source';

CREATE INDEX IF NOT EXISTS idx_financial_records_auto_synced 
    ON financial_records ((metadata->>'auto_synced')) 
    WHERE metadata->>'auto_synced' = 'true';

-- Add helpful comment
COMMENT ON FUNCTION sync_stock_transaction_to_financial_records() IS 
'Auto-creates financial expense records when stock transactions (PURCHASE/ADJUSTMENT) occur. Essential for UMKM cashflow tracking.';

COMMENT ON FUNCTION sync_operational_cost_to_financial_records() IS 
'Auto-creates financial expense records when operational costs are added. Ensures all business expenses are tracked.';

COMMENT ON FUNCTION sync_operational_cost_update_to_financial_records() IS 
'Auto-creates financial adjustment records when operational costs are updated. Maintains accurate expense tracking.';