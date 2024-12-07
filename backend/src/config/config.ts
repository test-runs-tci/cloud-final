export const config = {
    "dev": {
      "username": process.env.POSTGRES_USERNAME,
      "password": process.env.POSTGRES_PASSWORD,
      "database": process.env.POSTGRES_DB,
      "host": process.env.POSTGRES_HOST,
      "postgres_disable_ssl": process.env.POSTGRES_DISABLE_SSL ?? false,
      "aws_region": process.env.AWS_REGION,
      "cognito_user_pool_id": process.env.COGNITO_USER_POOL_ID,
      "token_use": process.env.TOKEN_USE,
      "token_expiration": process.env.TOKEN_EXPIRATION,
      "url": process.env.URL    
    }
  }
  