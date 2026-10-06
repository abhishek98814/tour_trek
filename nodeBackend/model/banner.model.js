const mongoose = require("mogoose")

const BannerModel = mongoose.schema(
    {
        bannerName:String,
        // bannerCount: Number
    },
    {
        bannerTpe:['shortTime', 'longTime']
        // ty
    }
)