import 'dotenv/config';
import prisma from '../config/database.js';

export const criarServico = async (req, res) => {
    try {
        const { categoria, descricao, valor, duracao } = req.body;

        const novoServico = await prisma.servico.create({
            data: {
                categoria,
                descricao,
                valor,
                duracao
            }
        });

        return res.status(201).json({ mensagem: "Novo serviço criado com sucesso!", novoServico });
    } catch (erro) {
        return res.status(400).json({ erro: "Erro ao criar novo serviço!", detalhes: erro.message });
    }
};

export const listarServicos = async (req, res) => {
    try {
        const servicos = await prisma.servico.findMany()

        return res.status(200).json(servicos);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar os serviços!", detalhes: erro.message });
    }
};

export const listarServicoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const servico = await prisma.servico.findUnique({
            where: { id: Number(id) }
        });

        if (!servico) {
            return res.status(404).json({ erro: "Serviço não encontrado!" });
        }

        return res.status(200).json(servico)
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar o serviço!", detalhes: erro.message });
    }
};

export const editarServico = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria, descricao, valor, duracao } = req.body;

        let dadosAtualizados = { categoria, descricao, valor, duracao }

        const servicoAtualizado = await prisma.servico.update({
            where: { id: Number(id)},
            data: dadosAtualizados
        })

        return res.status(200).json({ mensagem: "Serviço atualizado com sucesso!", servicoAtualizado });
    } catch (erro) {
        return res.status(400).json({ erro: "Erro ao editar o serviço!", detalhes: erro.message });
    }
};

export const excluirServico = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.servico.delete({
            where: { id: Number(id) }
        })

        return res.status(200).json({ mensagem: "Serviço excluído com sucesso!" });
    } catch (erro) {
        return res.status(404).json({ erro: "Serviço não encontrado!" });
    }
};