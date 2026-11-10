export interface Client {
  id: string;
  name: string;
  slug: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  active: boolean;
  access_password?: string;
  created_at: string;
  machines_count?: number;
  open_tickets_count?: number;
}

export interface Machine {
  id: string;
  client_id: string;
  code: string;
  name: string;
  category: string;
  brand: string | null;
  location: string;
  status: 'operacional' | 'aguardando_manutencao' | 'em_manutencao';
  created_at: string;
  client?: Client;
}

export type TicketStatus = 'a_fazer' | 'fazendo' | 'feito';

export interface Ticket {
  id: string;
  ticket_number: number;
  client_id: string;
  machine_id: string;
  status: TicketStatus;
  requester_name: string;
  requester_phone: string | null;
  description: string;
  photo_url: string | null;
  sla_hours: number;
  sla_deadline: string;
  started_at: string | null;
  completed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  client?: Client;
  machine?: Machine;
}

export interface ExecutiveVisit {
  id?: string;
  client_id: string;
  client_name?: string;
  client_slug?: string;
  technician_name: string;
  service_type: string;
  visit_date: string;
  visit_time: string;
  description: string;
  machine_id?: string;
  machine_code?: string;
  machine_name?: string;
  status: 'feito' | 'fazendo';
  photo_url?: string | null;
  created_at?: string;
}
