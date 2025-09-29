const Massageshop = require('../models/Massageshop')
//@desc    GET all massageshops
//@route    GET /api/v1/massageshops
//@access   Public
exports.getMassageshops = async (req, res, next) => {
    let query;
    //Copy req query
    const reqQuery = {...req.query};
    console.log(reqQuery);
 
    //field to exclude
    const removeFields = ['select','sort', 'page', 'limit'];

    //loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // console.log(queryStr);
    query = Massageshop.find(JSON.parse(queryStr));

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' '); 
        query = query.sort(sortBy);
    }else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Massageshop.countDocuments();

    query = query.skip(startIndex).limit(limit);

    try{
        const massageshops = await query;
        const pagination = {};
        if(endIndex < total){
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        // console.log(massageshops);
        res.status(200).json({success:true, count: massageshops.length, pagination, data: massageshops});
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