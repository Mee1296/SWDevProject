const Massageshop = require('../models/Massageshop')
//@desc    GET all massageshops
//@route    GET /api/v1/massageshops
//@access   Public
exports.getMassageshops = async (req, res, next) => {
    try{
    const massageshops = await Massageshop.find();
    res.status(200).json({success:true, data: massageshops});
    }catch(err){
        res.status(400).json({success:false});
    }
}

//@desc     GET single massageshop
//@route    GET /api/v1/massageshops/:id
//@access   Public
exports.getMassageshop = async (req, res, next) => {
    try{
        const massageshop = await Massageshop.findById(req.params.id);
        if(!massageshop){
            return res.status(404).json({success:false, error: 'Massageshop not found'});
        }
        res.status(200).json({success: true, data: massageshop});
    }catch(err){
        res.status(400).json({success:false});
    }
}

//@desc     CREATE all massageshops
//@route    POST /api/v1/massageshops
//@access   Private
exports.createMassageshop = async (req, res, next) => {
    const massageshop = await Massageshop.create(req.body);
    res.status(200).json({success:true, data: massageshop});
}

//@desc     UPDATE single massageshop
//@route    PUT /api/v1/massageshops/:id
//@access   Private
exports.updateMassageshop = async (req, res, next) => {
    try{
        const massageshop = await Massageshop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!massageshop){
            return res.status(404).json({success:false, error: 'Massageshop not found'});
        }
        res.status(200).json({success: true, data: massageshop});
    }catch(err){
        res.status(400).json({success:false});
    }
}

//@desc     DELETE single massageshop
//@route    DELETE /api/v1/massageshops/:id
//@access   Private
exports.deleteMassageshop = async (req, res, next) => {
    try{
        const massageshop = await Massageshop.findByIdAndDelete(req.params.id);
        if(!massageshop){
            return res.status(404).json({success:false, error: 'Massageshop not found'});
        }
        res.status(200).json({success: true, data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }
}