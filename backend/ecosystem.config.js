// module.exports = {
//   apps: [
//     {
//       name: 'backend',
//       script: 'dist/main.js', // Путь к собранному файлу
//       // instances: 'max',
//       // exec_mode: 'cluster',
//       env: {
//         NODE_ENV: 'production',
//       },
//       watch: false,
//       autorestart: true,
//     },
//   ],
// };

require('dotenv').config({ path: './.env.deploy' });

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REPOSITORY,
  DEPLOY_REF,
  NODE_ENV
} = process.env;

module.exports = {
  apps: [{
    name: 'kupipodariday-backend',
    script: './dist/main.js', // Точка входа для NestJS
    instances: 'max',         // Кластеризация
    exec_mode: 'cluster',
    env: {
      NODE_ENV: NODE_ENV || 'production',
      JWT_SECRET: process.env.JWT_SECRET,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_DB: process.env.POSTGRES_DB
    },
    watch: false,
    autorestart: true,
    max_memory_restart: '1G'
  }],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPOSITORY,
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp -r .env.deploy ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/source`,
      'post-deploy': `
        cd ${DEPLOY_PATH}/source/backend &&
        docker-compose down &&
        git fetch --all &&
        git reset --hard origin/${DEPLOY_REF} &&
        docker-compose build --no-cache &&
        docker-compose up -d
      `,
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
