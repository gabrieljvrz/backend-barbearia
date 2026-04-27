import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido!' });
    }

    const [, token] = authHeader.split(' ');

    try {
        //dentro do payload vai o { id: usuario.id, role: usuario.role } enviado pelo controller
        const payload = jwt.verify(token, process.env.JWT_SECRET);
    
        req.usuario = {
            id: payload.id,
            role: payload.role.toUpperCase()
        }

        next();
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido ou expirado!' });
    }
};