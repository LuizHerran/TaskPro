import { Router } from 'express';
import { sqlite } from '../db.js';

export const pagamentosRouter = Router();

// POST /api/pagamentos/pix  → gerar cobrança PIX via Mercado Pago
pagamentosRouter.post('/pix', async (req, res) => {
  const { pedido_id, valor, descricao, email_pagador, nome_pagador, cpf_pagador } = req.body;

  if (!pedido_id || !valor || !email_pagador)
    return res.status(400).json({ error: 'pedido_id, valor e email_pagador são obrigatórios' });

  try {
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token || token === 'SEU_TOKEN_AQUI') {
      // Modo simulado (sem token real)
      const simulado = {
        id: `SIMULADO-${Date.now()}`,
        status: 'pending',
        point_of_interaction: {
          transaction_data: {
            qr_code: '00020126580014br.gov.bcb.pix0136simulado-pix-key@taskpro.com5204000053039865802BR5913TaskPro Ltda6009SAO PAULO62070503***6304ABCD',
            qr_code_base64: '',
          },
        },
      };
      sqlite.prepare('UPDATE pedidos SET pagamento_id=?, pagamento_status=? WHERE id=?')
        .run(simulado.id, 'PENDENTE', pedido_id);
      return res.json({ simulado: true, ...simulado });
    }

    // Chamada real ao Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': `taskpro-${pedido_id}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: descricao ?? 'Serviço TaskPro',
        payment_method_id: 'pix',
        payer: {
          email: email_pagador,
          first_name: nome_pagador?.split(' ')[0] ?? 'Cliente',
          last_name: nome_pagador?.split(' ').slice(1).join(' ') ?? '',
          identification: { type: 'CPF', number: cpf_pagador ?? '00000000000' },
        },
      }),
    });

    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) throw new Error(JSON.stringify(data));

    sqlite.prepare('UPDATE pedidos SET pagamento_id=?, pagamento_status=? WHERE id=?')
      .run(String(data.id), String(data.status), pedido_id);

    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro no pagamento';
    res.status(500).json({ error: msg });
  }
});

// GET /api/pagamentos/status/:pedido_id  → checar status do pagamento
pagamentosRouter.get('/status/:pedido_id', (req, res) => {
  const pedido = sqlite.prepare(
    'SELECT id, pagamento_id, pagamento_status, valor FROM pedidos WHERE id = ?'
  ).get(req.params.pedido_id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(pedido);
});

// POST /api/pagamentos/webhook  → Mercado Pago notifica mudança de status
pagamentosRouter.post('/webhook', (req, res) => {
  const { data, type } = req.body as { data?: { id?: string }; type?: string };
  if (type === 'payment' && data?.id) {
    // Atualizar status do pagamento no banco (simplificado)
    sqlite.prepare(
      'UPDATE pedidos SET pagamento_status=? WHERE pagamento_id=?'
    ).run('APROVADO', String(data.id));
  }
  res.sendStatus(200);
});
