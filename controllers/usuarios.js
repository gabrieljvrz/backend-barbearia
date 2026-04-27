import 'dotenv/config';
import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import { resolve } from 'dns';

//CREATE
export const criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, telefone, role } = req.body

        const senhaHash = await bcrypt.hash(senha, 10);
        
        const novoUsuario = await prisma.Usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                telefone, 
                role
            }
        });

        const { senha: _, ...usuarioSemSenha } = novoUsuario;

        return res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: usuarioSemSenha });
    } catch (erro) {
        return res.status(400).json({ erro: 'Erro ao criar novo usuário!', detalhes: erro.message });
    }
};

//READ
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.Usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                role: true,
            }
        });

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao buscar usuários!' });
    }
};

//READ:ID
export const listarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await prisma.Usuario.findUnique({
            where: { id: Number(id) }
        });

        if(!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado!' });
        }

        const { senha: _, ...usuarioSemSenha } = usuario;

        return res.status(200).json(usuarioSemSenha);
    } catch (error) {
        return res.status(500).json({ erro: "Erro no servidor!" });
    }
}

//UPDATE
export const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha, telefone, role } = req.body;

        let dadosAtualizados = { nome, email, telefone, role };

        if (senha) {
            dadosAtualizados.senha = await bcrypt.hash(senha, 10);
        }

        const usuarioAtualizado = await prisma.Usuario.update({
            where: { id: Number(id) },
            data: dadosAtualizados
        });

        const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;

        return res.status(200).json(usuarioSemSenha);
    } catch (erro) {
        return res.status(400).json({ erro: 'Erro ao atualizar o usuário', detalhes: erro.message });
    }
};

//DELETE
export const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.Usuario.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({ mensagem: 'Usuário excluído com sucesso!' });
    } catch (erro) {
        return res.status(404).json({ erro: 'Usuário não encontrado!' });
    }
};