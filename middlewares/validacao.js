export const validarDados = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            //o .parse() pega o objeto que veio do body e compara campo por campo com as regras definidas no schema

            next();
        } catch (erro) {
            const errosFormatados = erro.errors.map(err => {
                return {
                    campo: err.path[0], //nome do campo
                    mensagem: err.message //texto de erro definido no schema
                };
            });

            return res.status(400).json({
                erro: 'Erro de validação',
                detalhes: errosFormatados
            });
        }
    };
};