import mongoose from 'mongoose'

const accessHashSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    expires: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
})

const AccessHash = mongoose.model('AccessHash', accessHashSchema)

export default AccessHash