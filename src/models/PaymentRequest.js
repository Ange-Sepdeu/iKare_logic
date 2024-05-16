import mongoose from "mongoose";
const { Schema } = mongoose;


const PaymentRequestSchema = new Schema({
    name: { type: String, require: true },
    id: { type: Schema.Types.ObjectId, require: true },
    field: { type: String, require: true },
    email: { type: String, require: true },
    type: { type: String, require: true },
    kind:{ type: String, require: true },
    year:{ type: String, require: true },
    amount: { type: Number, require: true },
    penality: { type: Number, require: true },
    duration: { type: Number, require: true },
    beginPenality: { type: Date, require: true },
    validated: {
        By: {
            name: { type: String, require: true },
            id: { type: Schema.Types.ObjectId, require: true }
        },
        On: { type: Date, require: true },
        status: { type: Boolean, require: true, default: false }
    },
    created: {
        By: {
            name: { type: String, require: true },
            id: { type: Schema.Types.ObjectId, require: true }
        },
        On: { type: Date, require: true }
    }
})

const PaymentRequest = mongoose.model('PaymentRequest', PaymentRequestSchema);
export default PaymentRequest;