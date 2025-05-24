-- Update script for PhanCongMuonPhong table
ALTER TABLE PhanCongMuonPhong ADD COLUMN IF NOT EXISTS LyDoTuChoi VARCHAR(500) NULL;

-- Update existing enum values if needed
UPDATE PhanCongMuonPhong SET TrangThai = 'CHUAXULY' WHERE TrangThai = 'CHOMUON';
UPDATE PhanCongMuonPhong SET TrangThai = 'DADONGY' WHERE TrangThai = 'DAMUON';

-- Add any missing columns for other tables (based on errors)
ALTER TABLE yeu_cau_muon_phong ADD COLUMN IF NOT EXISTS id_nguoi_gui VARCHAR(255) NULL; 