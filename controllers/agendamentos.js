import prisma from '../config/database.js';

export const criarAgendamento = async (req, res) => {
    try {
        const { servicoId, barbeiroId, data_hora_inicio } = req.body;

        const servico = await prisma.servico.findUnique({
            where: { id: Number(servicoId) }
        })

        if(!servico) {
            return res.status(404).json({ erro: "Serviço não encontrado!" });
        }

        const inicioNovoAgendamento = new Date(data_hora_inicio);
        const fimNovoAgendamento = new Date(inicioNovoAgendamento.getTime() + servico.duracao * 60000);

        const horarioOcupado = await prisma.agendamento.findFirst({
            where: {
                barbeiroId: barbeiroId,
                status: { not: 'CANCELADO' }, //se o agendamenot antigo foi cancelado, o horário está livre
                data_hora_inicio: { lt: fimNovoAgendamento }, //less than: o agendamento começa antes do novo terminar?
                data_hora_fim: { gt: inicioNovoAgendamento } //greater than: o agendamento antigo termina depois do novo começar?
                //se as duas forem true ao msm tempo, o prisma encontra um agendamento conflitante, entra no if(horarioOcupado) e bloqueia
            }
        });

        if (horarioOcupado) {
            return res.status(409).json({ erro: "Esse horário está indisponível para agendamento!" })
        }

        const clienteId = req.usuario.id;

        const novoAgendamento = await prisma.agendamento.create({
            data: {
                servicoId,
                barbeiroId,
                clienteId,
                data_hora_inicio: inicioNovoAgendamento,
                data_hora_fim: fimNovoAgendamento
            }
        });

        return res.status(201).json({ mensagem: "Agendamento criado com sucesso!", novoAgendamento });
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao criar o agendamento!", detalhes: erro.message });
    }
};

export const listarAgendamentos = async (req, res) => {
    try {
        const usuarioRole = req.usuario.role;
        const usuarioId = req.usuario.id;

        if (usuarioRole === 'ADMIN') {
            const agendamentos = await prisma.agendamento.findMany();
            return res.status(200).json(agendamentos)
        }

        if (usuarioRole === 'BARBEIRO') {
            const agendamentosPorBarbeiro = await prisma.agendamento.findMany({
                where: { barbeiroId: usuarioId }
            });
            return res.status(200).json(agendamentosPorBarbeiro);
        }

        const agendamentosPorCliente = await prisma.agendamento.findMany({
            where: { clienteId: usuarioId }
        });

        return res.status(200).json(agendamentosPorCliente)
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar os agendamentos!", detalhes: erro.message });
    }
}

export const listarAgendamentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const usuarioRole = req.usuario.role;

        const agendamento = await prisma.agendamento.findUnique({
            where: { id: Number(id) }
        });

        if (!agendamento) {
            return res.status(404).json({ erro: "Agendamento não encontrado!" });
        }

        const isAdmin = usuarioRole === 'ADMIN';
        const isBarbeiro = usuarioRole === 'BARBEIRO' && agendamento.barbeiroId === usuarioId;
        const isCliente = usuarioRole === 'CLIENTE' && agendamento.clienteId === usuarioId;

        if (isAdmin || isBarbeiro || isCliente) {
            return res.status(200).json(agendamento);
        }

        return res.status(403).json({ erro: "Acesso negado!" });

    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar o agendamento!", detalhes: erro.message });
    }
};

export const editarAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { servicoId, barbeiroId, data_hora_inicio, status } = req.body;
        
        const usuarioId = req.usuario.id;
        const usuarioRole = req.usuario.role;

        const agendamentoExistente = await prisma.agendamento.findUnique({
            where: { id: Number(id) }
        });

        if (!agendamentoExistente) {
            return res.status(404).json({ erro: "Agendamento não encontrado!" });
        }

        const isAdmin = usuarioRole === 'ADMIN';
        const isBarbeiro = usuarioRole === 'BARBEIRO' && agendamentoExistente.barbeiroId === usuarioId;
        const isCliente = usuarioRole === 'CLIENTE' && agendamentoExistente.clienteId === usuarioId;

        if (!isAdmin && !isBarbeiro && !isCliente) {
            return res.status(403).json({ erro: "Acesso negado. Você só pode modificar seus próprios agendamentos!" });
        }

        let dadosAtualizados = { servicoId, barbeiroId, status };

        if (data_hora_inicio || servicoId) {
            const idServicoBusca = servicoId ? Number(servicoId) : agendamentoExistente.servicoId;
            const servico = await prisma.servico.findUnique({
                where: { id: idServicoBusca }
            });

            const inicioNovoAgendamento = data_hora_inicio ? new Date(data_hora_inicio) : agendamentoExistente.data_hora_inicio;
            const fimNovoAgendamento = new Date(inicioNovoAgendamento.getTime() + servico.duracao * 60000);

            const horarioOcupado = await prisma.agendamento.findFirst({
                where: {
                    barbeiroId: barbeiroId || agendamentoExistente.barbeiroId,
                    status: { not: 'CANCELADO' },
                    data_hora_inicio: { lt: fimNovoAgendamento },
                    data_hora_fim: { gt: inicioNovoAgendamento },
                    id: { not: Number(id) }
                }
            });
            
            if (horarioOcupado) {
                return res.status(409).json({ erro: "Esse horário está indisponível para agendamento!" });
            }

            dadosAtualizados.data_hora_inicio = inicioNovoAgendamento;
            dadosAtualizados.data_hora_fim = fimNovoAgendamento;
        }

    
        const agendamentoAtualizado = await prisma.agendamento.update({
            where: { id: Number(id) },
            data: dadosAtualizados
        })

        return res.status(200).json({ mensagem: "Agendamento atualizado com sucesso!", agendamentoAtualizado });
    } catch (erro) {
        return res.status(400).json({ erro: "Erro ao editar o agendamento!", detalhes: erro.message });
    }
};

//hard delete
export const excluirAgendamento = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.agendamento.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({ mensagem: "Agendamento excluído com sucesso!" });
    } catch (erro) {
        return res.status(404).json({ erro: "Agendamento não encontrado!" });
    }
};