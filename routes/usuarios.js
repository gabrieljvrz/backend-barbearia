import express from 'express';

import { verificarToken } from '../middlewares/autenticacao.js'
import { verificarRole, verificarPropriedade } from '../middlewares/autorizacao.js';
import { validarDados } from '../middlewares/validacao.js'

import { usuarioCreateSchema, usuarioUpdateSchema } from '../schemas/usuarioSchema.js';

import { 
    criarUsuario, 
    listarUsuarios, 
    listarUsuarioPorId, 
    editarUsuario, 
    excluirUsuario 
} from '../controllers/usuarios.js';

const router = express.Router();

router.post('/', validarDados(usuarioCreateSchema), criarUsuario);
router.get('/', verificarToken, verificarRole(['ADMIN']), listarUsuarios);
router.get('/:id', verificarToken, verificarPropriedade, listarUsuarioPorId);
router.put('/:id', verificarToken, verificarPropriedade, validarDados(usuarioUpdateSchema), editarUsuario);
router.delete('/:id', verificarToken, verificarRole(['ADMIN']), excluirUsuario);

export default router;