import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let db_name, db_user, db_password;

// Load environment variables
db_name = process.env.DB_NAME;
db_user = process.env.DB_USER;
db_password = process.env.DB_PASSWORD;



// Create a Sequelize instance
const sequelize = new Sequelize(db_name, db_user, db_password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default sequelize;
