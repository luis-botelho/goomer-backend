-- Products
ALTER TABLE "products"
ADD CONSTRAINT "products_price_positive_check"
CHECK ("price" > 0);


-- Promotions
ALTER TABLE "promotions"
ADD CONSTRAINT "promotions_promotional_price_positive_check"
CHECK ("promotional_price" > 0);


-- Promotion schedules
ALTER TABLE "promotion_schedules"
ADD CONSTRAINT "promotion_schedules_weekday_check"
CHECK ("weekday" BETWEEN 0 AND 6);


ALTER TABLE "promotion_schedules"
ADD CONSTRAINT "promotion_schedules_time_range_check"
CHECK ("end_time" > "start_time");