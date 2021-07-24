const roomModel = require('../Models/roomModel');
const roomExist = async (roomID) => {
    const response = await roomModel.findOne({ roomID });
    if (response) {
        return true;
    }
    else return false;
}
module.exports = roomExist;