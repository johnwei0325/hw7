import mongoose from 'mongoose';
const Schema = mongoose.Schema
// Creating a schema, sort of like working with an ORM

const UserSchema = new Schema({
    name: { type: String, required: [true, 'Name field is required.']},
    chatBoxes: [{ type: mongoose.Types.ObjectId, ref: 'ChatBox'}],
});

const UserModel = mongoose.model('User', UserSchema)

const MessageSchema = new Schema({
    chatBox: { type: mongoose.Types.ObjectId, ref: 'ChatBox'},
    sender: { type: mongoose.Types.ObjectId, ref: 'User'},
    body: { type: String, required: [true, 'Body field is required.']}
})
// Creating a table within database with the defined schema
const MessageModel = mongoose.model('Message', MessageSchema)

const ChatBoxSchema = new Schema({
    name: {type: String, required: [true, 'Body field is required.']},
    users: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    messages: [{ type: mongoose.Types.ObjectId, ref: 'Message'}]
})

const ChatBoxModel = mongoose.model('ChatBox', ChatBoxSchema)
// Exporting table for querying and mutating
const PasswordSchema = new Schema({
    name : {type: String, required: [true, 'Body field is required.']},
    password : {type: String, required: [true, 'Body field is required.']}
})

const PasswordModel = mongoose.model('Password', PasswordSchema)

export  {UserModel, MessageModel, ChatBoxModel, PasswordModel};// ChatBoxModel