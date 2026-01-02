-- --------------------------------------------------------
-- Seed Data for Plook Arai Dee Platform (PostgreSQL)
-- --------------------------------------------------------

-- 1. สร้างข้อมูล Users (ผู้ใช้งาน)
-- user_01: เกษตรกร (สมชาย)
-- user_02: ผู้รับซื้อ (บริษัท อาหารสัตว์ไทย)

INSERT INTO "users" ("id", "username", "email", "passwordHash", "role", "phoneNumber", "isVerified", "updatedAt") 
VALUES 
('user_01', 'somchai_farm', 'somchai@email.com', 'hashed_pw_123', 'FARMER', '081-111-1111', true, NOW()),
('user_02', 'thai_feed_co', 'purchase@thaifeed.com', 'hashed_pw_456', 'BUYER', '02-999-9999', true, NOW());

-- 2. สร้าง User Profiles
INSERT INTO "user_profiles" ("id", "userId", "fullName", "address", "bio", "avatarUrl") 
VALUES 
('profile_01', 'user_01', 'สมชาย ใจดี', '123 ต.มาบตาพุด อ.เมือง จ.ระยอง', 'เกษตรกรผู้ปลูกข้าวโพดและเลี้ยงปลา ประสบการณ์ 10 ปี', 'https://example.com/avatars/somchai.jpg'),
('profile_02', 'user_02', 'บริษัท อาหารสัตว์ไทย จำกัด', '555 ถ.วิภาวดี กรุงเทพฯ', 'ผู้ผลิตอาหารสัตว์รายใหญ่ ต้องการวัตถุดิบคุณภาพสูง', 'https://example.com/avatars/thaifeed.jpg');

-- 3. สร้าง Farms (แปลงเกษตรของสมชาย)
INSERT INTO "farms" ("id", "farmerId", "name", "locationLat", "locationLng", "areaSize", "soilType", "waterSource") 
VALUES 
('farm_01', 'user_01', 'ไร่สมชาย แปลง 1', 13.820000, 100.050000, 15.00, 'ดินร่วนปนทราย', 'IRRIGATION'),
('farm_02', 'user_01', 'บ่อปลาสมชาย', 13.825000, 100.055000, 5.00, 'ดินเหนียว', 'GROUNDWATER');

-- 4. สร้าง Products (ข้อมูลพืช/สัตว์)
-- JSON array [1,5,9] หมายถึงเดือนที่เหมาะสม (ม.ค., พ.ค., ก.ย.)

INSERT INTO "products" ("name", "category", "growthDurationDays", "suitableMonths", "baseCostPerRai", "imageUrl") 
VALUES 
('ข้าวโพดเลี้ยงสัตว์', 'CROP', 110, '[5, 6, 7]', 4500.00, 'corn.jpg'),
('มะเขือเทศโรงงาน', 'CROP', 90, '[10, 11, 12]', 8000.00, 'tomato.jpg'),
('ปลานิล', 'AQUATIC', 180, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 15000.00, 'tilapia.jpg');

-- 5. สร้าง Market Prices (ประวัติราคา - สมมติ Product ID 1, 2, 3 ตามลำดับ)
-- หมายเหตุ: ต้องตรวจสอบ ID จริงในตาราง products อีกครั้ง (ในที่นี้สมมติเป็น 1, 2, 3)

INSERT INTO "market_prices" ("productId", "sourceName", "priceMin", "priceMax", "dateRecorded") 
VALUES 
(1, 'ตลาดไท', 10.50, 11.25, '2023-10-01'),
(1, 'สมาคมผู้ค้าพืชไร่', 10.00, 10.80, '2023-10-02'),
(2, 'ตลาดสี่มุมเมือง', 4.00, 5.50, '2023-10-01'),
(3, 'สะพานปลาอ่างศิลา', 45.00, 55.00, '2023-10-01');

-- 6. สร้าง Buy Requests (ประกาศรับซื้อจากบริษัทอาหารสัตว์)
INSERT INTO "buy_requests" ("id", "buyerId", "productId", "quantityRequired", "priceOffered", "description", "expiryDate", "status") 
VALUES 
('req_01', 'user_02', 1, 100.00, 11.50, 'ต้องการข้าวโพดความชื้นไม่เกิน 14% รับไม่อั้น', '2023-12-31', 'OPEN');

-- 7. สร้าง Cultivations (รอบการปลูกของสมชาย)
INSERT INTO "cultivations" ("id", "farmId", "productId", "startDate", "expectedHarvestDate", "estimatedYield", "status") 
VALUES 
('cult_01', 'farm_01', 1, '2023-09-01', '2023-12-20', 12000.00, 'GROWING');

-- 8. สร้าง Contracts (สัญญาซื้อขาย)
-- สมชายทำสัญญาส่งมอบข้าวโพดให้บริษัทอาหารสัตว์
INSERT INTO "contracts" ("id", "cultivationId", "buyRequestId", "farmerId", "buyerId", "agreedPrice", "agreedQuantity", "status", "signedAt") 
VALUES 
('contract_01', 'cult_01', 'req_01', 'user_01', 'user_02', 11.50, 10000.00, 'SIGNED', NOW());

-- --------------------------------------------------------
-- Additional Sample Data (ข้อมูลตัวอย่างเพิ่มเติม)
-- --------------------------------------------------------

-- 9. เพิ่ม Users อีก (เกษตรกรและผู้รับซื้อเพิ่มเติม)
INSERT INTO "users" ("id", "username", "email", "passwordHash", "role", "phoneNumber", "isVerified", "updatedAt") 
VALUES 
('user_03', 'preecha_rice', 'preecha@email.com', 'hashed_pw_789', 'FARMER', '089-222-2222', true, NOW()),
('user_04', 'somying_veg', 'somying@email.com', 'hashed_pw_abc', 'FARMER', '086-333-3333', true, NOW()),
('user_05', 'cpf_purchase', 'purchase@cpf.co.th', 'hashed_pw_def', 'BUYER', '02-888-8888', true, NOW()),
('user_06', 'betagro_buy', 'sourcing@betagro.com', 'hashed_pw_ghi', 'BUYER', '02-777-7777', true, NOW());

-- 10. เพิ่ม User Profiles
INSERT INTO "user_profiles" ("id", "userId", "fullName", "address", "bio", "avatarUrl") 
VALUES 
('profile_03', 'user_03', 'ปรีชา ทองดี', '456 ต.บ้านฉาง อ.บ้านฉาง จ.ระยอง', 'เกษตรกรปลูกข้าวและมันสำปะหลัง ประสบการณ์ 15 ปี', 'https://example.com/avatars/preecha.jpg'),
('profile_04', 'user_04', 'สมหญิง ใจงาม', '789 ต.มาบยางพร อ.ปลวกแดง จ.ระยอง', 'ปลูกผักอินทรีย์และเลี้ยงกุ้ง', 'https://example.com/avatars/somying.jpg'),
('profile_05', 'user_05', 'บริษัท ซีพีเอฟ จำกัด (มหาชน)', '313 ถ.สีลม เขตบางรัก กรุงเทพฯ', 'ผู้นำด้านเกษตรอุตสาหกรรมและอาหาร ต้องการวัตถุดิบปริมาณมาก', 'https://example.com/avatars/cpf.jpg'),
('profile_06', 'user_06', 'บริษัท เบทาโกร จำกัด (มหาชน)', '323 ถ.วิภาวดีรังสิต กรุงเทพฯ', 'ผู้ผลิตอาหารสัตว์และเนื้อสัตว์คุณภาพสูง', 'https://example.com/avatars/betagro.jpg');

-- 11. เพิ่ม Farms
INSERT INTO "farms" ("id", "farmerId", "name", "locationLat", "locationLng", "areaSize", "soilType", "waterSource") 
VALUES 
('farm_03', 'user_03', 'ไร่ข้าวปรีชา', 13.750000, 100.920000, 25.00, 'ดินเหนียว', 'IRRIGATION'),
('farm_04', 'user_03', 'ไร่มันสำปะหลังปรีชา', 13.755000, 100.925000, 20.00, 'ดินร่วน', 'RAIN'),
('farm_05', 'user_04', 'ฟาร์มผักอินทรีย์สมหญิง', 12.920000, 100.880000, 8.00, 'ดินร่วนปนทราย', 'GROUNDWATER'),
('farm_06', 'user_04', 'บ่อกุ้งสมหญิง', 12.925000, 100.885000, 10.00, 'ดินเหนียว', 'IRRIGATION');

-- 12. เพิ่ม Products
INSERT INTO "products" ("name", "category", "growthDurationDays", "suitableMonths", "baseCostPerRai", "imageUrl") 
VALUES 
('มันสำปะหลัง', 'CROP', 270, '[4, 5, 6]', 3500.00, 'cassava.jpg'),
('อ้อย', 'CROP', 365, '[10, 11, 12]', 5000.00, 'sugarcane.jpg'),
('กุ้งขาว', 'AQUATIC', 120, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 25000.00, 'shrimp.jpg'),
('ไก่เนื้อ', 'LIVESTOCK', 45, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 50000.00, 'chicken.jpg'),
('หมู', 'LIVESTOCK', 180, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 80000.00, 'pig.jpg');

-- 13. เพิ่ม Market Prices (สมมติ Product ID 4-8 ตามลำดับ)
INSERT INTO "market_prices" ("productId", "sourceName", "priceMin", "priceMax", "dateRecorded") 
VALUES 
-- มันสำปะหลัง (id=4)
(4, 'สมาคมมันสำปะหลังไทย', 2.80, 3.20, '2023-10-01'),
(4, 'ตลาดกลางโพธิ์แจ้', 2.70, 3.10, '2023-10-02'),
(4, 'สมาคมมันสำปะหลังไทย', 2.90, 3.30, '2023-10-15'),
-- อ้อย (id=5)
(5, 'สมาคมชาวไร่อ้อย', 1200.00, 1350.00, '2023-10-01'),
(5, 'โรงงานน้ำตาลมิตรผล', 1250.00, 1400.00, '2023-10-05'),
-- กุ้งขาว (id=6)
(6, 'ตลาดทะเลไทย', 180.00, 220.00, '2023-10-01'),
(6, 'สมาคมกุ้งไทย', 175.00, 210.00, '2023-10-03'),
-- ไก่เนื้อ (id=7)
(7, 'สมาคมผู้เลี้ยงไก่เนื้อ', 36.00, 42.00, '2023-10-01'),
(7, 'ตลาดสดไท', 38.00, 45.00, '2023-10-02'),
-- หมู (id=8)
(8, 'สมาคมผู้เลี้ยงสุกร', 70.00, 82.00, '2023-10-01'),
(8, 'ตลาดสี่มุมเมือง', 72.00, 85.00, '2023-10-03'),
-- Additional historical prices for existing products
(1, 'ตลาดไท', 10.20, 11.00, '2023-10-10'),
(1, 'ตลาดไท', 10.80, 11.50, '2023-10-20'),
(2, 'ตลาดสี่มุมเมือง', 4.50, 6.00, '2023-10-10'),
(3, 'สะพานปลาอ่างศิลา', 48.00, 58.00, '2023-10-10');

-- 14. เพิ่ม Buy Requests
INSERT INTO "buy_requests" ("id", "buyerId", "productId", "quantityRequired", "priceOffered", "description", "expiryDate", "status") 
VALUES 
('req_02', 'user_05', 4, 500.00, 3.00, 'ต้องการมันสำปะหลังแป้งสูง 25% ขึ้นไป รับตลอดปี', '2024-06-30', 'OPEN'),
('req_03', 'user_06', 7, 50000.00, 40.00, 'รับซื้อไก่เนื้อน้ำหนัก 2.2-2.5 กก. ส่งทุกสัปดาห์', '2024-03-31', 'OPEN'),
('req_04', 'user_05', 6, 10000.00, 200.00, 'ต้องการกุ้งขาวไซส์ 40 ตัว/กก. ส่งมอบรายเดือน', '2024-06-30', 'OPEN'),
('req_05', 'user_02', 2, 200.00, 5.00, 'รับซื้อมะเขือเทศโรงงานเกรด A สำหรับทำซอส', '2024-02-28', 'OPEN');

-- 15. เพิ่ม Cultivations
INSERT INTO "cultivations" ("id", "farmId", "productId", "startDate", "expectedHarvestDate", "estimatedYield", "status") 
VALUES 
('cult_02', 'farm_04', 4, '2023-05-01', '2024-01-25', 80000.00, 'GROWING'),
('cult_03', 'farm_06', 6, '2023-08-01', '2023-12-01', 5000.00, 'HARVESTED'),
('cult_04', 'farm_05', 2, '2023-10-15', '2024-01-15', 8000.00, 'GROWING'),
('cult_05', 'farm_02', 3, '2023-06-01', '2023-12-01', 3000.00, 'SOLD');

-- 16. เพิ่ม Contracts
INSERT INTO "contracts" ("id", "cultivationId", "buyRequestId", "farmerId", "buyerId", "agreedPrice", "agreedQuantity", "status", "signedAt") 
VALUES 
('contract_02', 'cult_03', 'req_04', 'user_04', 'user_05', 195.00, 5000.00, 'COMPLETED', '2023-08-15'),
('contract_03', 'cult_05', 'req_01', 'user_01', 'user_02', 50.00, 3000.00, 'COMPLETED', '2023-06-10');