import { NextResponse } from 'next/server';

// Senha única do QR de visita técnica (uso do Leandro). Fica só no servidor (env VISITA_PASSWORD).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const expected = process.env.VISITA_PASSWORD?.trim();
  const ok = !!expected && typeof body?.senha === 'string' && body.senha.trim() === expected;
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
