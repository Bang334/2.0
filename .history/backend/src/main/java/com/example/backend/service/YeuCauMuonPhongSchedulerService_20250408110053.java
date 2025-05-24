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
        
        // Lấy danh sách các yêu cầu đã duyệt
        List<YeuCauMuonPhong> danhSachYeuCau = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        
        for (YeuCauMuonPhong yeuCau : danhSachYeuCau) {
            // Kiểm tra xem đã có bản ghi trong lịch sử mượn phòng chưa
            List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            if (!lichSuList.isEmpty()) {
                continue; // Đã có bản ghi lịch sử, bỏ qua
            }

            // Tính thời gian còn lại (5 phút trước khi trả phòng)
            Calendar thoiGianNhacNho = Calendar.getInstance();
            thoiGianNhacNho.setTime(yeuCau.getThoiGianTra());
            thoiGianNhacNho.add(Calendar.MINUTE, -5);
            
            // Nếu đã đến thời gian nhắc nhở
            if (now.after(thoiGianNhacNho.getTime()) && now.before(yeuCau.getThoiGianTra())) {
                // Tạo thông báo nhắc nhở
                ThongBaoGui thongBaoGui = new ThongBaoGui();
                thongBaoGui.setTieuDe("Nhắc nhở trả phòng");
                thongBaoGui.setNoiDung("Bạn còn 5 phút nữa là đến thời gian trả phòng " + yeuCau.getPhong().getMaPhong() + 
                    ". Vui lòng chuẩn bị trả phòng đúng giờ.");
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