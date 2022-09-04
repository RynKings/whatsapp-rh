
const mongoose = require("mongoose");

class RHDatabase {

    constructor(){
        this.url = process.env.MONGODB_URL
    }

    connect(){
        mongoose.connect(this.url);
        this.db = mongoose.connection;
        this.db.on("error", console.error.bind(console, "connection error: "));
        this.db.once("open", function () {
            console.log("MongoDB connected successfully");
        });
    }

    pollModel(){
        const pollSchema = new mongoose.Schema({
            to: Object,
        });
        const Poll = mongoose.model('Poll', pollSchema)
        return Poll;
    }

}

module.exports = RHDatabase;