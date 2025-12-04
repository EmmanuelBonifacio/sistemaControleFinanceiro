const jwt = require('jsonwebtoken');

const autenticacaoMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        erro: "Token não fornecido. Use: Authorization: Bearer {token}" 
      });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        erro: "Formato de token inválido. Use: Bearer {token}" 
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        erro: "Token expirado. Faça login novamente." 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        erro: "Token inválido." 
      });
    }

    return res.status(500).json({ 
      erro: "Erro ao validar token" 
    });
  }
};

module.exports = {
  autenticacaoMiddleware
};
