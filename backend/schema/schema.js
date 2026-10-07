const mongoose=require('mongoose');

const userSchema= new mongoose.Schema(   {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        recoveryCodeHashes: {
            type: [String],
            select: false,
            default: []
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        resetPasswordToken: {
            type: String,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            select: false
        },

        passwordResetRequestedAt: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true
    });
    const User=mongoose.model('User',userSchema);
    module.exports=User;
