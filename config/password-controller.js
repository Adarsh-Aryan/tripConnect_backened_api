const bcrypt= require('bcryptjs')

const {hash,compare}= bcrypt

const hashingPassword=async(password)=>{

    const hashedPassword= await hash(password,10)

    return hashedPassword
}

const verifyPassword= async(password,hashedPassword)=>{

    return  await compare(password,hashedPassword)
}

module.exports={hashingPassword,verifyPassword}