export const verificarRole = (cargosPermitidos) => {
    return (req, res, next) => {
        const usuarioTemPermissao = cargosPermitidos.includes(req.usuario.role);
        
        if (!usuarioTemPermissao) {
            return res.status(403).json({ erro: 'Acesso negado.' });
        }
        
        next();
    };
};

export const verificarPropriedade = (req, res, next) => {
    //id passado na rota (que será editado)
    const idRota = Number(req.params.id);

    //id e role de qm fez a req
    const usuarioId = req.usuario.id;
    const usuarioRole = req.usuario.role;

    if (usuarioRole === 'ADMIN') {
        return next();
    }

    if (usuarioId === idRota) {
        return next()
    }

    return res.status(403).json({ erro: 'Acesso negado!' });
};