import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await prisma.Usuario.findUnique({
            where: { email }
        });

        if(!usuario) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if(!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
        }

        const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ mensagem: 'Login aprovado!', token });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro interno no servidor', detalhes: erro.message });
    }
};