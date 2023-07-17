const mongoose = require('mongoose');

const url = "mongodb+srv://Neeraja:Hiclousia%40123@cluster0.koj69cg.mongodb.net/test?retryWrites=true&w=majority"  ;

const collectionName = 'skillstemplates';

const insertskillstemplates = async function(req, res) {
    try {
    const collection = mongoose.connection.collection(collectionName);
    const insertedData = await collection.insertOne(req.body);
    res.status(200).send({ status: true, data: insertedData, message: 'Skills data created' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
  

const getskillstemplates  = async function(req,res){
    
    try{
        const { jobProfile } = req.query;
        if (!jobProfile) {
          return res.status(400).send({ status: false, message: 'jobProfiles parameter is missing' });
        }
    
        const jobProfileArray = jobProfile.split(',');
    
        const collection = mongoose.connection.collection(collectionName);
        const data = await collection.find({ jobProfile: { $in: jobProfileArray } }).toArray();
    
        if (!data || data.length === 0) {
          return res.status(404).send({ status: false, message: 'No matching jobProfiles found' });
        }
    
        return res.status(200).send({ status: true, data: data, message: 'Skills data fetched successfully' });
    }catch(err){
        res.status(500).send({status: false ,message: err.message})
    }
}

module.exports = {insertskillstemplates ,  getskillstemplates};
