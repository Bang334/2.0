package com.example.backend.payload.request;

import java.util.Date;

import jakarta.validation.constraints.NotNull;

public class DoiLichDayRequest {
	@NotNull
	private Integer maTKB;
	
	@NotNull
	private Date ngayHoc;
	
	@NotNull
	private Integer tietBatDau;
	
	@NotNull
	private Integer tietKetThuc;

	public Integer getMaTKB() {
		return maTKB;
	}

	public void setMaTKB(Integer maTKB) {
		this.maTKB = maTKB;
	}

	public Date getNgayHoc() {
		return ngayHoc;
	}

	public void setNgayHoc(Date ngayHoc) {
		this.ngayHoc = ngayHoc;
	}

	public Integer getTietBatDau() {
		return tietBatDau;
	}

	public void setTietBatDau(Integer tietBatDau) {
		this.tietBatDau = tietBatDau;
	}

	public Integer getTietKetThuc() {
		return tietKetThuc;
	}

	public void setTietKetThuc(Integer tietKetThuc) {
		this.tietKetThuc = tietKetThuc;
	}
}
