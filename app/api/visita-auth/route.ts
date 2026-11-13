import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Senha única do QR de visita técnica (uso do Leandro). Fica só no servidor (env VISITA_PASSWORD).
const expected = () => process.env.VISITA_PASSWORD?.trim();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ok = !!expected() && typeof body?.senha === 'string' && body.senha.trim() === expected();
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}

// Mostra a senha no painel: só para quem está logado no admin (token do Supabase Auth).
export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const { data } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
  if (!data.user) return NextResponse.json({ senha: null }, { status: 401 });
  return NextResponse.json({ senha: expected() ?? null });
}
