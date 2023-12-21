const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

/* https://www.youtube.com/watch?v=JlM81PN9OP4 */

dotenv.config({
    path: path.resolve(__dirname, `../env/${process.env.NODE_ENV}.env`)
});

console.log(`environment set ${process.env.NODE_ENV}`);

const db_connection = () => {
    mongoose.connect(`${process.env.HOST}${process.env.DATABASE}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        (err) => {
            if (err) console.log(err);
            else console.log("db connection success");
        }
    )
}

module.exports = { db_connection }