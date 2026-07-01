export interface VoucherTag {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  poster_images?: string[];
  school_poster_images?: string[];
  vote_count: number;
}

export interface AdminWork {
  id: string;
  work_number: string | null;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address?: string;
  images: string[];
  poster_images?: string[];
  school_poster_images?: string[];
  status: "pending" | "approved" | "rejected" | "hold";
  reject_reason: string | null;
  customer_number?: string;
  admin_remarks?: string;
  voucher_tag?: VoucherTag | null;
  created_at: string;
}
