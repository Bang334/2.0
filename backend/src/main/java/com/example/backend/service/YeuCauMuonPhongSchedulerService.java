package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.ThongBaoGuiRepository;
import com.example.backend.repository.ThongBaoNhanRepository;
import com.example.backend.repository.LichSuMuonPhongRepository;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.model.LichSuMuonPhong;
import com.example.backend.model.Phong;
import java.util.Date;
import java.util.List;
import java.util.Calendar;

@Service
public class YeuCauMuonPhongSchedulerService {

    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;

    @Autowired
    private ThongBaoGuiRepository thongBaoGuiRepository;

    @Autowired
    private ThongBaoNhanRepository thongBaoNhanRepository;

    @Autowired
    private LichSuMuonPhongRepository lichSuMuonPhongRepository;

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút (5 * 60 * 1000 ms)
    public void kiemTraVaCapNhatTrangThaiYeuCau() {
        Date now = new Date();
        System.out.println("Time Restart: " + now);
        // Lấy danh sách các yêu cầu đã duyệt
        List<YeuCauMuonPhong> danhSachYeuCau = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        
        for (YeuCauMuonPhong yeuCau : danhSachYeuCau) {
            // Kiểm tra xem yêu cầu đã có trong lịch sử mượn phòng chưa
            List<LichSuMuonPhong> lichSu = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            if (!lichSu.isEmpty()) {
                // Nếu đã có bản ghi trong lịch sử, bỏ qua yêu cầu này
                continue;
            }

            // Tính thời gian trễ (30 phút sau thời gian mượn)
            Calendar thoiGianTre = Calendar.getInstance();
            thoiGianTre.setTime(yeuCau.getThoiGianMuon());
            thoiGianTre.add(Calendar.MINUTE, 30);
            
            // Nếu đã quá thời gian trễ cho phép
            if (now.after(thoiGianTre.getTime())) {
                // Cập nhật trạng thái yêu cầu
                yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET);
                yeuCau.setLyDo("Yêu cầu đặt phòng đã bị hủy vì bạn đến trễ");
                yeuCauMuonPhongRepository.save(yeuCau);
                
                // Tạo thông báo
                ThongBaoGui thongBaoGui = new ThongBaoGui();
                thongBaoGui.setTieuDe("Thông báo hủy yêu cầu mượn phòng");
                thongBaoGui.setNoiDung("Yêu cầu mượn phòng " + yeuCau.getPhong().getMaPhong() + 
                    " từ " + yeuCau.getThoiGianMuon() + " đến " + yeuCau.getThoiGianTra() + 
                    " đã bị hủy do bạn đến trễ.");
                thongBaoGui.setThoiGian(now);
                thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
                
                // Gửi thông báo đến người mượn
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                thongBaoNhan.setThongBaoGui(thongBaoGui);
                thongBaoNhan.setNguoiNhan(yeuCau.getNguoiMuon());
                thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                thongBaoNhanRepository.save(thongBaoNhan);
            }
        }
    }

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
    public void nhacNhoTraPhong() {
        Date now = new Date();
        System.out.println("Kiểm tra nhắc nhở trả phòng: " + now);
        
        List<LichSuMuonPhong> danhSachChuaTra = lichSuMuonPhongRepository.findByThoiGianTraThucTeIsNull();
        
        for (LichSuMuonPhong lichSu : danhSachChuaTra) {
            YeuCauMuonPhong yeuCau = lichSu.getYeuCauMuonPhong();
            Date thoiGianTra = yeuCau.getThoiGianTra();
            // Nếu đã quá thời gian trả
            if (now.after(thoiGianTra)) {
                long diffMillis = now.getTime() - thoiGianTra.getTime();
                long diffMinutes = diffMillis / (60 * 1000); 
    
                // Chỉ nhắc nếu quá hạn dưới 20 phút
                if (diffMinutes <= 20) {
                    // Tạo thông báo nhắc nhở
                    ThongBaoGui thongBaoGui = new ThongBaoGui();
                    thongBaoGui.setTieuDe("Nhắc nhở trả phòng");
                    thongBaoGui.setNoiDung("Bạn đã quá thời gian trả phòng " + yeuCau.getPhong().getMaPhong() + 
                        ". Vui lòng trả phòng ngay lập tức.");
                    thongBaoGui.setThoiGian(now);
                    thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
    
                    // Gửi thông báo đến người mượn
                    ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                    thongBaoNhan.setThongBaoGui(thongBaoGui);
                    thongBaoNhan.setNguoiNhan(yeuCau.getNguoiMuon());
                    thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                    thongBaoNhanRepository.save(thongBaoNhan);
                }
            }
        }
    }

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
    public void kiemTraYeuCauDangXuLy() {
        Date now = new Date();
        System.out.println("Kiểm tra yêu cầu đang xử lý: " + now);
        
        // Lấy danh sách các yêu cầu đang xử lý
        List<YeuCauMuonPhong> danhSachDangXuLy = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY);
        
        for (YeuCauMuonPhong yeuCau : danhSachDangXuLy) {
            // Tính thời gian mượn + 5 phút
            Calendar thoiGianGracePeriod = Calendar.getInstance();
            thoiGianGracePeriod.setTime(yeuCau.getThoiGianMuon());
            thoiGianGracePeriod.add(Calendar.MINUTE, 5);
            
            // Nếu đã quá thời gian mượn + 5 phút (grace period 5 phút)
            if (now.after(thoiGianGracePeriod.getTime())) {
                // Cập nhật trạng thái yêu cầu
                yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET);
                yeuCau.setLyDo("Hệ thống đang gặp sự cố");
                yeuCauMuonPhongRepository.save(yeuCau);
                
                // Tạo thông báo
                ThongBaoGui thongBaoGui = new ThongBaoGui();
                thongBaoGui.setTieuDe("Thông báo hủy yêu cầu mượn phòng");
                thongBaoGui.setNoiDung("Yêu cầu mượn phòng " + yeuCau.getPhong().getMaPhong() + 
                    " từ " + yeuCau.getThoiGianMuon() + " đến " + yeuCau.getThoiGianTra() + 
                    " đã bị hủy do hệ thống gặp sự cố.");
                thongBaoGui.setThoiGian(now);
                thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
                
                // Gửi thông báo đến người mượn
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                thongBaoNhan.setThongBaoGui(thongBaoGui);
                thongBaoNhan.setNguoiNhan(yeuCau.getNguoiMuon());
                thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                thongBaoNhanRepository.save(thongBaoNhan);
                
                System.out.println("Đã hủy yêu cầu mượn phòng " + yeuCau.getMaYeuCau() + 
                    " vì đã quá 5 phút từ thời gian mượn " + yeuCau.getThoiGianMuon());
            }
        }
    }

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
    public void kiemTraPhongBaoTri() {
        Date now = new Date();
        System.out.println("Kiểm tra phòng bảo trì: " + now);
        
        // Lấy danh sách các yêu cầu đã được duyệt
        List<YeuCauMuonPhong> danhSachYeuCau = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        
        for (YeuCauMuonPhong yeuCau : danhSachYeuCau) {
            // Kiểm tra nếu phòng đang trong trạng thái bảo trì
            if (yeuCau.getPhong().getTrangThai() == Phong.TrangThai.BAOTRI) {
                // Tính thời gian 30 phút trước khi mượn
                Calendar thoiGianKiemTra = Calendar.getInstance();
                thoiGianKiemTra.setTime(yeuCau.getThoiGianMuon());
                thoiGianKiemTra.add(Calendar.MINUTE, -30);
                
                // Nếu đã đến thời điểm kiểm tra (30 phút trước khi mượn)
                if (now.after(thoiGianKiemTra.getTime())) {
                    // Kiểm tra xem đã có bản ghi trong lịch sử mượn phòng chưa
                    List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
                    
                    // Chỉ cập nhật và gửi thông báo nếu chưa có bản ghi lịch sử
                    if (lichSuList.isEmpty()) {
                        // Cập nhật trạng thái yêu cầu
                        yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET);
                        yeuCau.setLyDo("Phòng đang được bảo trì");
                        yeuCauMuonPhongRepository.save(yeuCau);
                        
                        // Tạo thông báo
                        ThongBaoGui thongBaoGui = new ThongBaoGui();
                        thongBaoGui.setTieuDe("Thông báo hủy yêu cầu mượn phòng");
                        thongBaoGui.setNoiDung("Vì phòng " + yeuCau.getPhong().getMaPhong() + 
                            " đang được bảo trì nên yêu cầu mượn phòng của bạn từ " + 
                            yeuCau.getThoiGianMuon() + " đến " + yeuCau.getThoiGianTra() + 
                            " đã bị hủy, xin bạn hãy thông cảm cho chúng tôi.");
                        thongBaoGui.setThoiGian(now);
                        thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
                        
                        // Gửi thông báo đến người mượn
                        ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                        thongBaoNhan.setThongBaoGui(thongBaoGui);
                        thongBaoNhan.setNguoiNhan(yeuCau.getNguoiMuon());
                        thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                        thongBaoNhanRepository.save(thongBaoNhan);
                    }
                }
            }
        }
    }
    
    @Scheduled(fixedRate = 86400000) // Chạy mỗi 24 giờ (1 ngày)
    public void xoaThongBaoCuDaDoc() {
        Date now = new Date();
        System.out.println("Bắt đầu xóa thông báo cũ đã đọc: " + now);
        
        // Tính thời gian 30 ngày trước
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -30);
        Date ngayTruoc30Ngay = calendar.getTime();
        
        // Tìm các thông báo đã đọc và cũ hơn 30 ngày
        List<ThongBaoNhan> danhSachThongBaoCu = thongBaoNhanRepository.findByTrangThaiAndThongBaoGui_ThoiGianBefore(
            ThongBaoNhan.TrangThai.DADOC, ngayTruoc30Ngay);
        
        int soLuongXoa = danhSachThongBaoCu.size();
        if (soLuongXoa > 0) {
            // Xóa các thông báo cũ
            for (ThongBaoNhan thongBaoNhan : danhSachThongBaoCu) {
                thongBaoNhanRepository.delete(thongBaoNhan);
            }
            
            System.out.println("Đã xóa " + soLuongXoa + " thông báo cũ đã đọc.");
        } else {
            System.out.println("Không có thông báo cũ đã đọc cần xóa.");
        }
    }
}