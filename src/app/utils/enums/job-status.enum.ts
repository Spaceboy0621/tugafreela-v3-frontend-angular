export enum JobStatusEnum {
    ativo = 'ativo',
    pagamento = 'aguardando_pagamento',
    andamento = 'em_andamento',
    novo_prazo = 'solicitado_novo_prazo',
    concluido_freela = 'concluido_pelo_freelancer',
    concluido = 'concluido',
    fechado_cliente = 'fechado_pelo_cliente',
    fechado_freela = 'fechado_pelo_freelancer',
    fechado_para_freela = 'fechado_a_favor_do_freelancer',
    fechado_para_cliente = 'fechado_a_favor_do_cliente',
    fechado_divisao = 'fechado_em_divisao',
    disputa = 'em_disputa',
    cancelado = 'cancelado',
    pausado = 'pausado',
    rodada_fechada = 'rodada_fechada'
}