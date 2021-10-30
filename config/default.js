module.exports = {
  server: {
    port: 3500
  },
  db: {
    host: 'localhost',
    name: 'metrics-backend',
    port: 5432,
    user: 'metrics-backend',
    pass: 'metrics-backend',
    pool: {
      min: 0,
      max: 10
    }
  },
  jwt: {
    signingKey: 'defaultsigningkeydefaultsigningkey',
    signingAlgorithm: 'HS512',
    expiration: '1h',
    audience: 'metrics-backend',
    subject: 'metrics-backend',
    issuer: 'metrics-backend'
  }
};
