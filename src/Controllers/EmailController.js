const userModel = require("../Models/userModel");
const jobModel = require('../Models/jobModel');
const revenueRModel = require('../Models/revenueRModel');
const recruiterModel = require("../Models/recruiterModel");
const userprofileModel = require('../Models/userprofileModel');

const mailSender=require("./../Middlewares/sendMail")

async function SendMail(req,res){
try
{
    const ID = req.query.id; 
    const userId=req.query.senderId

    const jobPost = await jobModel.findOne({_id : ID});

    if (!jobPost) {
      return res.status(404).send({ status: false, message: 'Job post not found' });
    }
    const recruiter=await recruiterModel.findOne({userDetailsId:jobPost.userDetailsId})
    const user= await userModel.findOne({_id:userId})
    if (!user) {
        return res.status(404).send({ status: false, data:user,message: 'user post not found' });
      }
    const emailBody = `${user.firstName +' ' + user.lastName} has applied to your job post. Visit href='hiclousia.com' for more details `
    await mailSender.sendMail(recruiter.email,`${user.firstName +' ' + user.lastName} has applied to your job post`,emailBody)
    res.status(200).send({status:true , message : "Mail sucessful" } )
}
catch(err){
    res.statu(500).send({status:false, message : err.message } )
}
};
async function SendMailToUsers(req,res){
    try
    {
         let users=req.body.users
         console.log(users)
         const ID = req.query.id; 
         const jobPost = await jobModel.findOne({_id : ID});

         if (!jobPost) {
           return res.status(404).send({ status: false, message: 'Job post not found' });
         }
         const recruiter=await recruiterModel.findOne({userDetailsId:jobPost.userDetailsId})

      
         if (!recruiter) {
            return res.status(404).send({ status: false, message: 'recruiter not found' });
          }
          let emailBody = `Your shortlisted candidates details are `
          users.map(async (user)=>{
            
              emailBody = emailBody+`
            Name :${user.user.firstName +' ' + user.user.lastName}  
            Email:${user.user.email}
            Phone No:${user.userProfile.phone}
            
            `

          })

      
        await mailSender.sendMail(recruiter.email,`Details of the shortlisted Candidates`,emailBody)
        res.status(200).send({status:true , message : "Mail sucessful" } )
    }
    catch(err){
        res.statu(500).send({status:false, message : err.message } )
    }
    };
    
module.exports={SendMail,SendMailToUsers}