import { Sequelize } from 'sequelize';

// Create a Sequelize instance
const sequelize = new Sequelize('employee_management_system', 'root', 'Zaheernaqvi@1472', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default sequelize;
