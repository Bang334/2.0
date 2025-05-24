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
            
            // Nếu đã quá thời gian trả
            if (now.after(yeuCau.getThoiGianTra())) {
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

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
    public void kiemTraYeuCauDangXuLy() {
        Date now = new Date();
        System.out.println("Kiểm tra yêu cầu đang xử lý: " + now);
        
        // Lấy danh sách các yêu cầu đang xử lý
        List<YeuCauMuonPhong> danhSachDangXuLy = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY);
        
        for (YeuCauMuonPhong yeuCau : danhSachDangXuLy) {
            // Nếu đã quá thời gian mượn
            if (now.after(yeuCau.getThoiGianMuon())) {
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