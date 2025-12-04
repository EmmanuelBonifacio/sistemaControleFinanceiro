// ==========================================
// ✅ MIDDLEWARE DE VALIDAÇÃO
// ==========================================

const { body, validationResult } = require('express-validator');

/**
 * Middleware para capturar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      erro: "Dados inválidos",
      detalhes: errors.array().map(e => ({
        campo: e.param,
        mensagem: e.msg
      }))
    });
  }
  
  next();
};

/**
 * Validações para Cadastro
 */
const validarCadastro = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/)
    .withMessage('Senha deve conter pelo menos um número'),
  
  handleValidationErrors
];

/**
 * Validações para Login
 */
const validarLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

/**
 * Validações para Transação
 */
const validarTransacao = [
  body('usuario_id')
    .isInt({ gt: 0 })
    .withMessage('ID do usuário inválido'),
  
  body('date')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO (YYYY-MM-DD)'),
  
  body('description')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Descrição deve ter entre 3 e 255 caracteres'),
  
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
  
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Valor deve ser um número positivo'),
  
  body('type')
    .isIn(['entrada', 'saída'])
    .withMessage('Tipo deve ser "entrada" ou "saída"'),
  
  handleValidationErrors
];

/**
 * Validações para Atualização de Transação
 */
const validarAtualizacaoTransacao = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO (YYYY-MM-DD)'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Descrição deve ter entre 3 e 255 caracteres'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
  
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Valor deve ser um número positivo'),
  
  body('type')
    .optional()
    .isIn(['entrada', 'saída'])
    .withMessage('Tipo deve ser "entrada" ou "saída"'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validarCadastro,
  validarLogin,
  validarTransacao,
  validarAtualizacaoTransacao
};
