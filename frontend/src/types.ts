export interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
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
  status: string;
  reject_reason: string | null;
  created_at: string;
}
