-- Up
ALTER TABLE products
    DROP COLUMN features,
    DROP COLUMN specifications,
    ALTER COLUMN price SET DATA TYPE NUMERIC(10,2),
    ADD COLUMN stock INT NOT NULL DEFAULT 0;
ALTER TABLE products RENAME COLUMN uuid TO sku;
ALTER TABLE products ALTER COLUMN sku SET DATA TYPE VARCHAR(255) USING sku::VARCHAR;
ALTER TABLE products RENAME COLUMN max_quantity TO max_purchase;
ALTER TABLE products RENAME COLUMN monthly_payment TO markup_rate;
ALTER TABLE products RENAME COLUMN tenure TO tenor;
UPDATE products SET plan = CASE WHEN plan = 3 THEN 5 ELSE 10 END;

-- Down
ALTER TABLE products
    ADD COLUMN features VARCHAR(255),
    ADD COLUMN specifications VARCHAR(255),
    DROP COLUMN stock;
ALTER TABLE products RENAME COLUMN sku TO uuid;
ALTER TABLE products RENAME COLUMN max_purchase TO max_quantity;
ALTER TABLE products RENAME COLUMN markup_rate TO monthly_payment;
ALTER TABLE products RENAME COLUMN tenor TO tenure;
UPDATE products SET plan = CASE WHEN plan = 5 THEN 3 ELSE 6 END;

