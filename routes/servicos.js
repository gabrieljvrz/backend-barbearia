import express from 'express';

import { verificarToken } from '../middlewares/autenticacao.js';
import { verificarRole } from '../middlewares/autorizacao.js';
import { validarDados } from '../middlewares/validacao.js';

import { servicoCreateSchema, servicoUpdateSchema } from '../schemas/servicoSchema.js';

import {
    criarServico,
    listarServicos,
    listarServicoPorId,
    editarServico,
    excluirServico
} from '../controllers/servicos.js';

const router = express.Router();

router.post('/', verificarToken, verificarRole(['ADMIN']), validarDados(servicoCreateSchema), criarServico);
router.get('/', verificarToken, listarServicos);
router.get('/:id', verificarToken, listarServicoPorId);
router.put('/:id', verificarToken, verificarRole(['ADMIN']), validarDados(servicoUpdateSchema), editarServico);
router.delete('/:id', verificarToken, verificarRole(['ADMIN']), excluirServico);

export default router;