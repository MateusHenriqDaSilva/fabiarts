import { NextRequest, NextResponse } from 'next/server';

// Usando as variáveis de ambiente do arquivo .env
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Interfaces para o payload do Mercado Pago
interface MercadoPagoPayer {
  email: string;
  identification?: {
    type: string;
    number: string;
  };
}

interface MercadoPagoTransactionDetails {
  financial_institution: null;
}

interface MercadoPagoPayload {
  transaction_amount: number;
  description: string;
  payer: MercadoPagoPayer;
  payment_method_id?: string;
  date_of_expiration?: string;
  token?: string;
  installments?: number;
  transaction_details?: MercadoPagoTransactionDetails;
  capture?: boolean;
}

interface RequestBody {
  transaction_amount: number;
  description?: string;
  payer: {
    email: string;
  };
  payment_method_id?: string;
  token?: string;
  installments?: number;
}

function generateIdempotencyKey(): string {
  return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Criando pagamento...');

  // Validação das variáveis de ambiente
  if (!ACCESS_TOKEN) {
    console.error('❌ ACCESS_TOKEN não configurado no .env');
    return NextResponse.json(
      { 
        error: 'Configuração do servidor incompleta',
        message: 'Token de acesso não configurado'
      },
      { status: 500 }
    );
  }

  try {
    const body: RequestBody = await request.json();

    // Validações básicas
    if (!body.transaction_amount || body.transaction_amount <= 0) {
      return NextResponse.json(
        { error: 'Valor da transação inválido' },
        { status: 400 }
      );
    }

    if (!body.payer?.email) {
      return NextResponse.json(
        { error: 'Email do pagador é obrigatório' },
        { status: 400 }
      );
    }

    // Payload base com tipo definido
    const payload: MercadoPagoPayload = {
      transaction_amount: Number(body.transaction_amount.toFixed(2)),
      description: body.description?.substring(0, 200) || 'Pagamento',
      payer: {
        email: body.payer.email,
      },
    };

    // Configuração específica para PIX
    if (body.payment_method_id === 'pix') {
      payload.payment_method_id = 'pix';
      payload.date_of_expiration = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }

    // Configuração específica para Cartão
    if (body.token) {
      payload.token = body.token;
      payload.installments = body.installments || 1;
      payload.payment_method_id = body.payment_method_id;
      payload.transaction_details = {
        financial_institution: null
      };
      payload.capture = true;
    }

    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    console.log('🔑 Usando Access Token:', ACCESS_TOKEN.substring(0, 10) + '...');

    const idempotencyKey = generateIdempotencyKey();
    
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('❌ Erro do Mercado Pago:', data);
      
      return NextResponse.json(
        { 
          error: 'Falha no pagamento',
          message: data.message,
          details: data.cause?.[0]?.description || data.error,
        },
        { status: mpResponse.status }
      );
    }

    console.log('✅ Pagamento criado!', {
      id: data.id,
      status: data.status,
      payment_method: data.payment_method_id,
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Erro interno:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar o pagamento'
      },
      { status: 500 }
    );
  }
}