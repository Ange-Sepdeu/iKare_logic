import dotenv from 'dotenv-flow'
dotenv.config({path: 'local.env'})

export const config={
    TRANSACTION_EQUIV: process.env.TRANSACTION_EQUIV,
    JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME
}
